package nlu.com.app.service.impl;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.response.DiscountResponseDTO;
import nlu.com.app.entity.*;
import nlu.com.app.exception.ApplicationException;
import nlu.com.app.exception.ErrorCode;
import nlu.com.app.mapper.DiscountMapper;
import nlu.com.app.repository.*;
import nlu.com.app.service.IDiscountService;
import nlu.com.app.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class DiscountServiceImpl implements IDiscountService {
    private static final double EARN_POINT_RATE = 10000.0;
    private final DiscountRepository discountRepository;
    private final DiscountMapper discountMapper;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserPointRepository userPointRepository;
    private final UserCouponRepository userCouponRepository;
    private final UserPointHistoryRepository userPointHistoryRepository;

    @Override
    public Discount createDiscount(Discount discount, List<Long> categoryIds) {
        Discount discount1 = discountRepository.save(discount);
        if (categoryIds != null || categoryIds.size() > 0) {
            for (Long categoryId : categoryIds) {
                Category category = categoryRepository.findByCategoryId(categoryId).get();
                DiscountCategories discountCategories = new DiscountCategories();
                discountCategories.setCategory(category);
                discountCategories.setDiscount(discount1);
                discount1.getDiscountCategories().add(discountCategories);
            }
        }
        return discount1;
    }

    @Override
    public Page<DiscountResponseDTO> getDiscounts(int page, int size) {
        Page<Discount> listDiscount = discountRepository.findAll(PageRequest.of(page, size));
        Page<DiscountResponseDTO> discountResponseDTOS = discountMapper.maptoPageDTO(listDiscount);
        return discountResponseDTOS;
    }

    @Override
    public Discount updateDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    @Override
    public boolean deleteDiscount(Discount discount) {
        try {
            discountRepository.delete(discount);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public Discount getDetailDiscount(Long id) {
        try {
            return discountRepository.findById(id).get();
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<DiscountResponseDTO> getDiscountsByUserId(Long userId) {
        System.out.println("Xem id của user: " + userId);
        List<Discount> discountList = discountRepository.findAvailableDiscountsForUser(userId);
        List<DiscountResponseDTO> discountResponseDTOS = discountMapper.mapToListDTO(discountList);
        return discountResponseDTOS;

    }

    @Transactional
    @Override
    //    Đổi discount bằng xu
    public void redeemDiscount(Long discountId) {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.DISCOUNT_NOT_FOUND));

        // 1. Kiểm tra cơ bản (Active, Date)
        if (!Boolean.TRUE.equals(discount.getIsActive()) ||
                discount.getEndDate().isBefore(java.time.LocalDate.now())) {
            throw new ApplicationException(ErrorCode.DISCOUNT_EXPIRED);
        }

        // 2. Kiểm tra Point Cost (Có phải mã đổi điểm không?)
        if (discount.getPointCost() == null || discount.getPointCost() <= 0) {
            throw new ApplicationException(ErrorCode.DISCOUNT_NOT_REDEEMABLE);
        }

        // 3. Kiểm tra số dư điểm của User
        UserPoint userPoint = userPointRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        if (userPoint.getTotalPoint() < discount.getPointCost()) {
            throw new ApplicationException(ErrorCode.NOT_ENOUGH_POINT);
        }

        // 4. Kiểm tra Global Limit (Số lượng tổng)
        // Nếu khác -1 và đã dùng hết -> Lỗi
        if (discount.getUsageLimit() != -1 && discount.getUseCount() >= discount.getUsageLimit()) {
            throw new ApplicationException(ErrorCode.DISCOUNT_OUT_OF_STOCK);
        }

        // 5. Kiểm tra Personal Limit (Số lần user đã đổi)
        // Đếm trong bảng UserCoupon
        long userRedeemedCount = userCouponRepository.countByUserAndDiscount(user, discount);
        if (discount.getUsageLimitPerUser() != -1 && userRedeemedCount >= discount.getUsageLimitPerUser()) {
            throw new ApplicationException(ErrorCode.DISCOUNT_LIMIT_REACHED);
        }

        // 6. Kiểm tra Rank (Nếu discount yêu cầu rank)
        if (discount.getRankForVipCustomer() != null) {
            // Logic so sánh Enum Rank (ví dụ dùng ordinal hoặc switch case)
            // Giả sử: Rank User phải >= Rank Discount
            if (userPoint.getUserRank().ordinal() < discount.getRankForVipCustomer().ordinal()) {
                throw new ApplicationException(ErrorCode.RANK_NOT_SUFFICIENT);
            }
        }

        // --- THỰC HIỆN GIAO DỊCH ---

        // A. Trừ điểm User
        userPoint.setTotalPoint(userPoint.getTotalPoint() - discount.getPointCost());
        //        Tích lũy điểm life_point cho user

        userPoint.setLifetimePoint(userPoint.getLifetimePoint() + calculateEarnedPoints(discount.getPointCost()));
        userPointRepository.save(userPoint);

        // B. Lưu lịch sử trừ điểm
        UserPointHistory history = UserPointHistory.builder()
                .userPoint(userPoint)
                .pointsChange(-discount.getPointCost())
                .description("Đổi mã giảm giá: " + discount.getCode())
                .createdAt(LocalDateTime.now())
                .build();
        userPointHistoryRepository.save(history);


        // C. Tăng biến đếm sử dụng tổng của Discount
        discount.setUseCount(discount.getUseCount() + 1);
        discountRepository.save(discount);

        // D. Cấp Voucher vào Ví (UserCoupon)
        UserCoupon userCoupon = UserCoupon.builder()
                .user(user)
                .discount(discount)
                .isUsed(false) // Mới đổi, chưa xài
                .redeemedAt(LocalDate.now())
                // Nếu muốn set hạn dùng 30 ngày kể từ lúc đổi, hoặc lấy theo endDate của discount
                .expiredAt(discount.getEndDate())
                .build();

        userCouponRepository.save(userCoupon);
    }

    private double calculateEarnedPoints(double totalAmount) {
        // Ví dụ: Làm tròn xuống
        return Math.floor(totalAmount / EARN_POINT_RATE);
    }
}
