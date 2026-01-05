package nlu.com.app.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import nlu.com.app.constant.*;
import nlu.com.app.dto.cart.Cart;
import nlu.com.app.dto.filter.OrderFilter;
import nlu.com.app.dto.request.CartItemRequestDTO;
import nlu.com.app.dto.request.OrderFilterRequest;
import nlu.com.app.dto.request.UpdateOrderStatus;
import nlu.com.app.dto.response.*;
import nlu.com.app.dto.spec.OrderSpecifications;
import nlu.com.app.entity.*;
import nlu.com.app.exception.ApplicationException;
import nlu.com.app.exception.ErrorCode;
import nlu.com.app.mapper.OrderMapper;
import nlu.com.app.repository.*;
import nlu.com.app.service.IOrderService;
import nlu.com.app.specification.OrderSpecification;
import nlu.com.app.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author VuLuu
 */
@Service
@RequiredArgsConstructor
@Transactional
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService implements IOrderService {

    // Định dạng ngày tháng theo mẫu: 23 th4, 2025 - 09:40 AM
    static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("d 'th'M, yyyy - hh:mm a");
    // Giả định tỷ lệ: 10,000 VND = 1 Point
    private static final double EARN_POINT_RATE = 10000.0;
    CartService cartService;
    BookRepository bookRepository;
    PromotionCategoriesRepository promotionCategoriesRepository;
    PaymentMethodRepository paymentMethodRepository;
    OrderRepository orderRepository;
    OrderItemRepository orderItemRepository;
    UserRepository userRepository;
    OrderMapper orderMapper;
    UserAddressRepository userAddressRepository;
    OrderTimelineRepository orderTimelineRepository;
    DiscountRepository discountRepository;
    UserPointRepository userPointRepository;
    UserPointHistoryRepository userPointHistoryRepository;
    SimpMessagingTemplate simpMessagingTemplate;
    ObjectMapper objectMapper;
    RedeemRepository redeemRepository;
    RefundItemsRepository refundItemsRepository;
    UserCouponRepository userCouponRepository;

    @Override
    @Transactional
    public OrderResponseDTO createOrderFromCart(List<CartItemRequestDTO> items, Long paymentMethodId, List<Long> listDiscountIds) {
        double amountDecrease = 0.0;
        double totalAmountForBook = 0.0;
        double totalAmountForRedeemReward = 0.0;
        double totalAmount = 0.0;
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }
        if (items == null || items.isEmpty()) {
            throw new ApplicationException(ErrorCode.NULL_CART_ITEM_REQUEST);
        }
        List<CartItemResponseDTO.BookItemResponseDTO> listRequestBook = new ArrayList<>();
        List<CartItemResponseDTO.RewardItemResponseDTO> listRequestRedeem = new ArrayList<>();
        for (CartItemRequestDTO item : items) {
            if (item.getTypePurchase().equals("BOOK")) {
                CartItemResponseDTO.BookItemResponseDTO book = objectMapper.convertValue(item.getItem(), CartItemResponseDTO.BookItemResponseDTO.class);
                listRequestBook.add(book);
            } else {
                CartItemResponseDTO.RewardItemResponseDTO redeem = objectMapper.convertValue(item.getItem(), CartItemResponseDTO.RewardItemResponseDTO.class);
                listRequestRedeem.add(redeem);
            }
        }
        List<Long> listIdRequestBook = listRequestBook.stream()
                .map(CartItemResponseDTO.BookItemResponseDTO::getProductId)
                .collect(Collectors.toList());

        User user = userRepository.findByUsername(username).get();

        Cart cart = cartService.getCart(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        Optional<UserAddress> defaultAddressOpt = userAddressRepository.findByUserAndIsDefaultTrue(
                user);
        if (defaultAddressOpt.isEmpty()) {
            throw new ApplicationException(ErrorCode.NO_DEFAULT_ADDRESS);
        }


        List<Book> books = bookRepository.findAllById(listIdRequestBook);

        // Map ProductId -> Book
        Map<Long, Book> bookMap = books.stream()
                .collect(Collectors.toMap(Book::getBookId, book -> book));

        // Get promotions (if applicable)
        List<Long> categoryIds = books.stream()
                .map(book -> book.getCategory().getCategoryId())
                .distinct()
                .toList();

        List<Promotion> promotions = promotionCategoriesRepository.findActivePromotionsByCategoryIds(
                categoryIds);

        Map<Long, Double> categoryDiscountMap = promotions.stream()
                .flatMap(p -> p.getPromotionCategories().stream()
                        .map(pc -> Map.entry(pc.getCategory().getCategoryId(), p.getDiscountPercentage())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, Math::max));

        Map<Long, Double> productDiscountMap = books.stream()
                .collect(Collectors.toMap(
                        Book::getBookId,
                        b -> categoryDiscountMap.getOrDefault(b.getCategory().getCategoryId(), 0D)
                ));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(EOrderStatus.PENDING_CONFIRMATION);
        order.setPendingConfirmationDate(LocalDateTime.now());

        List<OrderItem> bookOrderItems = calculateBookItems(listRequestBook, bookMap, productDiscountMap, order, user);
        List<OrderItem> redeemOrderItems = calculateRedeemRewardItems(listRequestRedeem, redeemRepository, order, user);

        List<OrderItem> allOrderItems = new ArrayList<>();
        allOrderItems.addAll(bookOrderItems);
        allOrderItems.addAll(redeemOrderItems);


        double totalDiscountAmount = 0.0; // Tổng tiền được giảm tất cả các loại

        if (listDiscountIds != null && !listDiscountIds.isEmpty()) {
            List<Discount> discounts = discountRepository.findAllById(listDiscountIds);
            List<UserDiscountUsage> userDiscountUsages = user.getUsedDiscounts();

            // Tách discount thành 2 nhóm
            List<Discount> itemLevelDiscounts = new ArrayList<>();
            List<Discount> orderLevelDiscounts = new ArrayList<>();

            for (Discount d : discounts) {
                if (d.getTargetType() == EDiscountTarget.ORDER) {
                    orderLevelDiscounts.add(d);
                } else {
                    itemLevelDiscounts.add(d); // BOOK, REDEEM, REWARD
                }
            }

            // --- GIAI ĐOẠN 1: ÁP DỤNG DISCOUNT CẤP ITEM (Book/Redeem) ---
            for (Discount discount : itemLevelDiscounts) {
                double discountAmountForThisCode = 0.0;

                if (discount.getTargetType() == EDiscountTarget.BOOK) {
                    // Lọc các sách thỏa mãn điều kiện category/sách của discount
                    List<OrderItem> eligibleItems = bookOrderItems.stream()
                            .filter(item -> isBookEligibleForDiscount(item.getBook(), discount))
                            .collect(Collectors.toList());

                    if (!eligibleItems.isEmpty()) {
                        // Tính tổng giá trị các item thỏa mãn (Dùng finalPrice hiện tại vì có thể đã bị giảm bởi KM khác - logic xếp chồng)
                        // Tuy nhiên thường item discount chỉ áp 1 mã, ở đây giả sử logic phân bổ
                        double eligibleAmount = eligibleItems.stream().mapToDouble(OrderItem::getFinalPrice).sum();

                        if (eligibleAmount > 0) {
                            if (discount.getDiscountType() == EDiscountType.PERCENT) {
                                discountAmountForThisCode = eligibleAmount * discount.getValue();
                            } else {
                                discountAmountForThisCode = Math.min(discount.getValue(), eligibleAmount);
                            }

                            // Phân bổ tiền giảm vào từng item (để update finalPrice)
                            distributeDiscountToItems(eligibleItems, discountAmountForThisCode, eligibleAmount);
                        }
                    }
                } else if (discount.getTargetType() == EDiscountTarget.REDEEM) {
                    // Logic cho Redeem (thường là giảm trên danh sách redeem)
                    double redeemTotal = redeemOrderItems.stream().mapToDouble(OrderItem::getFinalPrice).sum();
                    if (redeemTotal > 0) {
                        if (discount.getDiscountType() == EDiscountType.PERCENT) {
                            discountAmountForThisCode = redeemTotal * discount.getValue();
                        } else {
                            discountAmountForThisCode = Math.min(discount.getValue(), redeemTotal);
                        }
                        // Phân bổ vào các món redeem
                        distributeDiscountToItems(redeemOrderItems, discountAmountForThisCode, redeemTotal);
                    }
                }

                // Lưu lịch sử dùng
                if (discountAmountForThisCode > 0) {
                    totalDiscountAmount += discountAmountForThisCode;
                    recordDiscountUsage(user, discount, userDiscountUsages);
                }
                //        Xác nhận discount đã sử dụng
                UserCoupon userCoupon = userCouponRepository.findByUser_UserIdAndDiscount_DiscountIdAndIsUsedFalse(user.getUserId(), discount.getDiscountId()).orElse(null);
                if (userCoupon != null && userCoupon.getIsUsed() == false) {
                    userCoupon.setIsUsed(true);
                    userCoupon.setRedeemedAt(LocalDate.now());
                    userCoupon.setExpiredAt(discount.getEndDate());
                    userCouponRepository.save(userCoupon);
                } else {
                    throw new ApplicationException(ErrorCode.DISCOUNT_LIMIT_REACHED);
                }
            }

            // --- GIAI ĐOẠN 2: TÍNH TẠM TÍNH (SUBTOTAL) MỚI ---
            // Lúc này finalPrice của các item ĐÃ ĐƯỢC GIẢM bởi Phase 1
            double currentSubTotal = allOrderItems.stream().mapToDouble(OrderItem::getFinalPrice).sum();

            // --- GIAI ĐOẠN 3: ÁP DỤNG DISCOUNT CẤP ORDER ---
            double orderLevelReduction = 0.0;

            for (Discount discount : orderLevelDiscounts) {
                // Kiểm tra điều kiện tối thiểu đơn hàng (dựa trên Subtotal MỚI)
                if (currentSubTotal < discount.getMinOrderAmount()) {
                    continue; // Bỏ qua nếu sau khi giảm item, giá ko đủ min order
                }

                double discountVal = 0.0;
                if (discount.getDiscountType() == EDiscountType.PERCENT) {
                    discountVal = currentSubTotal * discount.getValue();
                } else {
                    discountVal = Math.min(discount.getValue(), currentSubTotal);
                }

                // Cộng dồn giảm giá Order
                orderLevelReduction += discountVal;

                // Lưu lịch sử dùng
                recordDiscountUsage(user, discount, userDiscountUsages);

//                Kiểm tra discount là loại mỗi người được phép sử dụng n lần hay là loại nhiều người đêều sử dụng chung
                if (discount.getUsageLimitPerUser() < 0) {
                    discount.setUseCount(discount.getUseCount() + 1);
                }
                //        Xác nhận discount đã sử dụng
                UserCoupon userCoupon = userCouponRepository.findByUser_UserIdAndDiscount_DiscountIdAndIsUsedFalse(user.getUserId(), discount.getDiscountId()).orElse(null);
                if (userCoupon != null && userCoupon.getIsUsed() == false) {
                    userCoupon.setIsUsed(true);
                    userCoupon.setRedeemedAt(LocalDate.now());
                    userCoupon.setExpiredAt(discount.getEndDate());
                    userCouponRepository.save(userCoupon);
                } else {
                    throw new ApplicationException(ErrorCode.DISCOUNT_LIMIT_REACHED);
                }
            }

            // Đảm bảo không giảm quá số tiền hiện có
            orderLevelReduction = Math.min(orderLevelReduction, currentSubTotal);
            totalDiscountAmount += orderLevelReduction;

            // --- GIAI ĐOẠN 4: PHÂN BỔ DISCOUNT ORDER NGƯỢC LẠI VÀO ITEM ---
            // Bước này cực quan trọng để Data Consistency: Tổng các item phải bằng Tổng đơn
            if (orderLevelReduction > 0) {
                distributeDiscountToItems(allOrderItems, orderLevelReduction, currentSubTotal);
            }
        }

        // 3. Tính toán lại lần cuối để ra Total Amount chốt
        // Lúc này item.getFinalPrice() đã gánh cả discount Item lẫn discount Order
        totalAmount = allOrderItems.stream().mapToDouble(OrderItem::getFinalPrice).sum();
        userRepository.save(user);

        List<OrderItem> listOrderItems = order.getOrderItems();
        listOrderItems.addAll(bookOrderItems);
        listOrderItems.addAll(redeemOrderItems);
        order.setOrderItems(listOrderItems);
        order.setTotalAmount(totalAmount);
        order.setAddress(defaultAddressOpt.get().getAddress());
        // Set payment method
        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.UNKNOWN_EXCEPTION));
        if (redeemOrderItems.size() > 0 && paymentMethod.getMethodName() != EPaymentMethod.WB_POINT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Đối với các sản phẩm bằng xu, vui lòng người dùng chọn thanh toán bằng xu WB Point"
            );
        }
        order.setPaymentMethod(paymentMethod);

//    OrderTimeline orderTimeline = OrderTimeline.builder()
//            .createdAt(LocalDateTime.now())
//            .orderStatus(EOrderStatus.PENDING_CONFIRMATION)
//            .name("Đơn hàng đã được tạo")
//            .description("Khách hàng xác nhận đơn hàng, chờ xác nhận.")
//            .order(order)
//            .build();

        // Save order
        orderRepository.save(order);
        orderItemRepository.saveAll(order.getOrderItems());

//    orderTimelineRepository.save(orderTimeline);

        // Clear cart
        cartService.removeItemsFromCart(user.getUserId(), items);

// - ---
        // Xử lý điểm thưởng (Trừ điểm thanh toán HOẶC Tích điểm)
        // Lưu ý: Logic tích điểm thường nên để ở bước "Xác nhận đơn hàng thành công" (Webhook payment)
        // thay vì lúc tạo đơn. Nhưng nếu tạo là thành công luôn thì để ở đây ok.

        processUserPoints(user, order, totalAmount, paymentMethod);
//        Thong bao co don moi cho ben Admin
        simpMessagingTemplate.convertAndSend("/notifyForAdminAboutOrder", "Đơn hàng #" + order.getOrderId() + " đã tạo");
        return orderMapper.toOrderResponseDTO(order);
    }

    @Override
    public OrderResponseDTO createOrderFromCartByPaypal(List<CartItemRequestDTO> items, Long paymentMethodId, List<Long> listDiscountIds, String captureId) {
        double amountDecrease = 0.0;
        double totalAmountForBook = 0.0;
        double totalAmountForRedeemReward = 0.0;
        double totalAmount = 0.0;
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }
        if (items == null || items.isEmpty()) {
            throw new ApplicationException(ErrorCode.NULL_CART_ITEM_REQUEST);
        }
        List<CartItemResponseDTO.BookItemResponseDTO> listRequestBook = new ArrayList<>();
        List<CartItemResponseDTO.RewardItemResponseDTO> listRequestRedeem = new ArrayList<>();
        for (CartItemRequestDTO item : items) {
            if (item.getTypePurchase().equals("BOOK")) {
                CartItemResponseDTO.BookItemResponseDTO book = objectMapper.convertValue(item.getItem(), CartItemResponseDTO.BookItemResponseDTO.class);
                listRequestBook.add(book);
            } else {
                CartItemResponseDTO.RewardItemResponseDTO redeem = objectMapper.convertValue(item.getItem(), CartItemResponseDTO.RewardItemResponseDTO.class);
                listRequestRedeem.add(redeem);
            }
        }
        List<Long> listIdRequestBook = listRequestBook.stream()
                .map(CartItemResponseDTO.BookItemResponseDTO::getProductId)
                .collect(Collectors.toList());

        User user = userRepository.findByUsername(username).get();

        Cart cart = cartService.getCart(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        Optional<UserAddress> defaultAddressOpt = userAddressRepository.findByUserAndIsDefaultTrue(
                user);
        if (defaultAddressOpt.isEmpty()) {
            throw new ApplicationException(ErrorCode.NO_DEFAULT_ADDRESS);
        }


        List<Book> books = bookRepository.findAllById(listIdRequestBook);

        // Map ProductId -> Book
        Map<Long, Book> bookMap = books.stream()
                .collect(Collectors.toMap(Book::getBookId, book -> book));

        // Get promotions (if applicable)
        List<Long> categoryIds = books.stream()
                .map(book -> book.getCategory().getCategoryId())
                .distinct()
                .toList();

        List<Promotion> promotions = promotionCategoriesRepository.findActivePromotionsByCategoryIds(
                categoryIds);

        Map<Long, Double> categoryDiscountMap = promotions.stream()
                .flatMap(p -> p.getPromotionCategories().stream()
                        .map(pc -> Map.entry(pc.getCategory().getCategoryId(), p.getDiscountPercentage())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, Math::max));

        Map<Long, Double> productDiscountMap = books.stream()
                .collect(Collectors.toMap(
                        Book::getBookId,
                        b -> categoryDiscountMap.getOrDefault(b.getCategory().getCategoryId(), 0D)
                ));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(EOrderStatus.PENDING_CONFIRMATION);
        order.setPendingConfirmationDate(LocalDateTime.now());

        List<OrderItem> bookOrderItems = calculateBookItems(listRequestBook, bookMap, productDiscountMap, order, user);
        List<OrderItem> redeemOrderItems = calculateRedeemRewardItems(listRequestRedeem, redeemRepository, order, user);

        List<OrderItem> allOrderItems = new ArrayList<>();
        allOrderItems.addAll(bookOrderItems);
        allOrderItems.addAll(redeemOrderItems);


        double totalDiscountAmount = 0.0; // Tổng tiền được giảm tất cả các loại

        if (listDiscountIds != null && !listDiscountIds.isEmpty()) {
            List<Discount> discounts = discountRepository.findAllById(listDiscountIds);
            List<UserDiscountUsage> userDiscountUsages = user.getUsedDiscounts();

            // Tách discount thành 2 nhóm
            List<Discount> itemLevelDiscounts = new ArrayList<>();
            List<Discount> orderLevelDiscounts = new ArrayList<>();

            for (Discount d : discounts) {
                if (d.getTargetType() == EDiscountTarget.ORDER) {
                    orderLevelDiscounts.add(d);
                } else {
                    itemLevelDiscounts.add(d); // BOOK, REDEEM, REWARD
                }
            }

            // --- GIAI ĐOẠN 1: ÁP DỤNG DISCOUNT CẤP ITEM (Book/Redeem) ---
            for (Discount discount : itemLevelDiscounts) {
                double discountAmountForThisCode = 0.0;

                if (discount.getTargetType() == EDiscountTarget.BOOK) {
                    // Lọc các sách thỏa mãn điều kiện category/sách của discount
                    List<OrderItem> eligibleItems = bookOrderItems.stream()
                            .filter(item -> isBookEligibleForDiscount(item.getBook(), discount))
                            .collect(Collectors.toList());

                    if (!eligibleItems.isEmpty()) {
                        // Tính tổng giá trị các item thỏa mãn (Dùng finalPrice hiện tại vì có thể đã bị giảm bởi KM khác - logic xếp chồng)
                        // Tuy nhiên thường item discount chỉ áp 1 mã, ở đây giả sử logic phân bổ
                        double eligibleAmount = eligibleItems.stream().mapToDouble(OrderItem::getFinalPrice).sum();

                        if (eligibleAmount > 0) {
                            if (discount.getDiscountType() == EDiscountType.PERCENT) {
                                discountAmountForThisCode = eligibleAmount * discount.getValue();
                            } else {
                                discountAmountForThisCode = Math.min(discount.getValue(), eligibleAmount);
                            }

                            // Phân bổ tiền giảm vào từng item (để update finalPrice)
                            distributeDiscountToItems(eligibleItems, discountAmountForThisCode, eligibleAmount);
                        }
                    }
                } else if (discount.getTargetType() == EDiscountTarget.REDEEM) {
                    // Logic cho Redeem (thường là giảm trên danh sách redeem)
                    double redeemTotal = redeemOrderItems.stream().mapToDouble(OrderItem::getFinalPrice).sum();
                    if (redeemTotal > 0) {
                        if (discount.getDiscountType() == EDiscountType.PERCENT) {
                            discountAmountForThisCode = redeemTotal * discount.getValue();
                        } else {
                            discountAmountForThisCode = Math.min(discount.getValue(), redeemTotal);
                        }
                        // Phân bổ vào các món redeem
                        distributeDiscountToItems(redeemOrderItems, discountAmountForThisCode, redeemTotal);
                    }
                }

                // Lưu lịch sử dùng
                if (discountAmountForThisCode > 0) {
                    totalDiscountAmount += discountAmountForThisCode;
                    recordDiscountUsage(user, discount, userDiscountUsages);
                }
                //        Xác nhận discount đã sử dụng
                UserCoupon userCoupon = userCouponRepository.findByUser_UserIdAndDiscount_DiscountIdAndIsUsedFalse(user.getUserId(), discount.getDiscountId()).orElse(null);
                if (userCoupon != null && userCoupon.getIsUsed() == false) {
                    userCoupon.setIsUsed(true);
                    userCoupon.setRedeemedAt(LocalDate.now());
                    userCoupon.setExpiredAt(discount.getEndDate());
                    userCouponRepository.save(userCoupon);
                } else {
                    throw new ApplicationException(ErrorCode.DISCOUNT_LIMIT_REACHED);
                }
            }

            // --- GIAI ĐOẠN 2: TÍNH TẠM TÍNH (SUBTOTAL) MỚI ---
            // Lúc này finalPrice của các item ĐÃ ĐƯỢC GIẢM bởi Phase 1
            double currentSubTotal = allOrderItems.stream().mapToDouble(OrderItem::getFinalPrice).sum();

            // --- GIAI ĐOẠN 3: ÁP DỤNG DISCOUNT CẤP ORDER ---
            double orderLevelReduction = 0.0;

            for (Discount discount : orderLevelDiscounts) {
                // Kiểm tra điều kiện tối thiểu đơn hàng (dựa trên Subtotal MỚI)
                if (currentSubTotal < discount.getMinOrderAmount()) {
                    continue; // Bỏ qua nếu sau khi giảm item, giá ko đủ min order
                }

                double discountVal = 0.0;
                if (discount.getDiscountType() == EDiscountType.PERCENT) {
                    discountVal = currentSubTotal * discount.getValue();
                } else {
                    discountVal = Math.min(discount.getValue(), currentSubTotal);
                }

                // Cộng dồn giảm giá Order
                orderLevelReduction += discountVal;

                // Lưu lịch sử dùng
                recordDiscountUsage(user, discount, userDiscountUsages);

//                Kiểm tra discount là loại mỗi người được phép sử dụng n lần hay là loại nhiều người đêều sử dụng chung
                if (discount.getUsageLimitPerUser() < 0) {
                    discount.setUseCount(discount.getUseCount() + 1);
                }
                //        Xác nhận discount đã sử dụng
                UserCoupon userCoupon = userCouponRepository.findByUser_UserIdAndDiscount_DiscountIdAndIsUsedFalse(user.getUserId(), discount.getDiscountId()).orElse(null);
                if (userCoupon != null && userCoupon.getIsUsed() == false) {
                    userCoupon.setIsUsed(true);
                    userCoupon.setRedeemedAt(LocalDate.now());
                    userCoupon.setExpiredAt(discount.getEndDate());
                    userCouponRepository.save(userCoupon);
                } else {
                    throw new ApplicationException(ErrorCode.DISCOUNT_LIMIT_REACHED);
                }
            }

            // Đảm bảo không giảm quá số tiền hiện có
            orderLevelReduction = Math.min(orderLevelReduction, currentSubTotal);
            totalDiscountAmount += orderLevelReduction;

            // --- GIAI ĐOẠN 4: PHÂN BỔ DISCOUNT ORDER NGƯỢC LẠI VÀO ITEM ---
            // Bước này cực quan trọng để Data Consistency: Tổng các item phải bằng Tổng đơn
            if (orderLevelReduction > 0) {
                distributeDiscountToItems(allOrderItems, orderLevelReduction, currentSubTotal);
            }
        }

        // 3. Tính toán lại lần cuối để ra Total Amount chốt
        // Lúc này item.getFinalPrice() đã gánh cả discount Item lẫn discount Order
        totalAmount = allOrderItems.stream().mapToDouble(OrderItem::getFinalPrice).sum();
        userRepository.save(user);

        List<OrderItem> listOrderItems = order.getOrderItems();
        listOrderItems.addAll(bookOrderItems);
        listOrderItems.addAll(redeemOrderItems);
        order.setOrderItems(listOrderItems);
        order.setTotalAmount(totalAmount);
        order.setAddress(defaultAddressOpt.get().getAddress());
        // Set payment method
        PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.UNKNOWN_EXCEPTION));
        order.setPaymentMethod(paymentMethod);
        order.setPaypalCaptureId(captureId);
//    OrderTimeline orderTimeline = OrderTimeline.builder()
//            .createdAt(LocalDateTime.now())
//            .orderStatus(EOrderStatus.PENDING_CONFIRMATION)
//            .name("Đơn hàng đã được tạo")
//            .description("Khách hàng xác nhận đơn hàng, chờ xác nhận.")
//            .order(order)
//            .build();

        // Save order
        orderRepository.save(order);
        orderItemRepository.saveAll(order.getOrderItems());
//    orderTimelineRepository.save(orderTimeline);

        // Clear cart
        cartService.removeItemsFromCart(user.getUserId(), items);

// - ---
        // Xử lý điểm thưởng (Trừ điểm thanh toán HOẶC Tích điểm)
        // Lưu ý: Logic tích điểm thường nên để ở bước "Xác nhận đơn hàng thành công" (Webhook payment)
        // thay vì lúc tạo đơn. Nhưng nếu tạo là thành công luôn thì để ở đây ok.

        processUserPoints(user, order, totalAmount, paymentMethod);
//        Thông báo cho Admin có đơn được tạo
        simpMessagingTemplate.convertAndSend("/notifyForAdminAboutOrder", "Đơn hàng #" + order.getOrderId() + " đã tạo");
        return orderMapper.toOrderResponseDTO(order);
    }

    public Page<OrderResponseDTO> getOrdersWithPagination(Pageable pageable) {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }
        User user = userRepository.findByUsername(username).orElseThrow(() -> new ApplicationException(ErrorCode.UNAUTHENTICATED));
        Page<Order> ordersPage = orderRepository.findAllByUserOrderByOrderIdDesc(user, pageable);
        return ordersPage.map(orderMapper::toOrderResponseDTO);
    }

    public Page<OrderDetailsResponseDTO> getOrdersWithPagination_ForAdmin(Pageable pageable) {
        Page<Order> ordersPage = orderRepository.findAll(pageable);
        return ordersPage.map(orderMapper::toOrderDetailsResponseDTO);
    }

    @Override
    public OrderDetailsResponseDTO getOrderById(Long id) {
        var order = orderRepository.findById(id)
                .orElseThrow(() -> new ApplicationException(ErrorCode.ORDER_NOT_FOUND));
        return orderMapper.toOrderDetailsResponseDTO(order);
    }

    @Override
    public void cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.UNKNOWN_EXCEPTION));

        if (order.getStatus() != EOrderStatus.PENDING_CONFIRMATION) {
            throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
        }
        if (order.getConfirmedDate() == null) {
            order.setConfirmedDate(LocalDateTime.now());
        }
        if (order.getShippingDate() == null) {
            order.setShippingDate(LocalDateTime.now());
        }
        if (order.getDeliveredDate() == null) {
            order.setDeliveredDate(LocalDateTime.now());
        }
        order.setStatus(EOrderStatus.CANCELED);
        order.setCancelledDate(LocalDateTime.now());
        orderRepository.save(order);
//        Thong bao cho Admin don da bi huy
        simpMessagingTemplate.convertAndSend("/notifyForAdminAboutOrder", "Đơn hàng #" + order.getOrderId() + " đã hủy");
    }

    @Override
    @Transactional
    public String updateOrderStatus(Long orderId, UpdateOrderStatus request) {
        // 1. Lấy đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.ORDER_NOT_FOUND));

        EOrderStatus currentStatus = order.getStatus();
        EOrderStatus newStatus = EOrderStatus.valueOf(request.getStatus());

        // 2. Kiểm tra logic hủy đơn hàng
//    if (newStatus == EOrderStatus.CANCELED) {
//      if (!(currentStatus == EOrderStatus.PENDING_CONFIRMATION || currentStatus == EOrderStatus.CONFIRMED)) {
//        throw new ApplicationException(ErrorCode.CANT_CANCEL_ORDER);
//      }
//    }
        // 2. Cập nhật trạng thái mới
        switch (newStatus) {
            case PENDING_CONFIRMATION:
                if (currentStatus == EOrderStatus.DELIVERED || currentStatus == EOrderStatus.SHIPPING || currentStatus == EOrderStatus.CANCELED || currentStatus == EOrderStatus.CONFIRMED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                order.setStatus(newStatus);
                order.setPendingConfirmationDate(LocalDateTime.now());
                break;
            case CONFIRMED:
                if (currentStatus == EOrderStatus.SHIPPING || currentStatus == EOrderStatus.CANCELED || currentStatus == EOrderStatus.DELIVERED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                order.setStatus(newStatus);
                order.setConfirmedDate(LocalDateTime.now());
                break;
            case SHIPPING:
                if (currentStatus == EOrderStatus.CANCELED || currentStatus == EOrderStatus.DELIVERED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                order.setStatus(newStatus);
                order.setShippingDate(LocalDateTime.now());
                break;
            case DELIVERED:
                if (currentStatus == EOrderStatus.CANCELED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                order.setStatus(newStatus);
                order.setDeliveredDate(LocalDateTime.now());
                break;
            case CANCELED:
                if (currentStatus == EOrderStatus.DELIVERED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                if (order.getConfirmedDate() == null) {
                    order.setConfirmedDate(LocalDateTime.now());
                }
                if (order.getShippingDate() == null) {
                    order.setShippingDate(LocalDateTime.now());
                }
                if (order.getDeliveredDate() == null) {
                    order.setDeliveredDate(LocalDateTime.now());
                }
                order.setStatus(newStatus);
                order.setCancelledDate(LocalDateTime.now());
                break;
        }


        // 3. Lưu trạng thái mới

        orderRepository.save(order);

        // 4. Tạo timeline phù hợp với trạng thái mới
//    OrderTimeline.OrderTimelineBuilder timelineBuilder = OrderTimeline.builder()
//            .createdAt(LocalDateTime.now())
//            .orderStatus(newStatus)
//            .order(order);
//
//    switch (newStatus) {
//      case PENDING_CONFIRMATION:
//        timelineBuilder
//                .name("Đơn hàng đã được tạo")
//                .description("Khách hàng xác nhận đơn hàng, chờ xác nhận.");
//        break;
//      case CONFIRMED:
//        timelineBuilder
//                .name("Đơn hàng đã được xác nhận")
//                .description("Đơn hàng đã được xác nhận bởi quản trị viên.");
//        break;
//      case SHIPPING:
//        timelineBuilder
//                .name("Đơn hàng đang được vận chuyển")
//                .description("Đơn hàng đã được giao cho đơn vị vận chuyển.");
//        break;
//      case DELIVERED:
//        timelineBuilder
//                .name("Đơn hàng đã giao thành công")
//                .description("Khách hàng đã nhận được đơn hàng.");
//        break;
//      case CANCELED:
//        timelineBuilder
//                .name("Đơn hàng đã bị hủy")
//                .description("Đơn hàng đã bị hủy bởi khách hàng hoặc quản trị viên.");
//        break;
//    }
//
//    orderTimelineRepository.save(timelineBuilder.build());

        return "Cập nhật trạng thái đơn hàng thành công";
    }

    @Override
    public String updateOrderStatusFromAdmin(Long orderId, UpdateOrderStatus request) {
        // 1. Lấy đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.ORDER_NOT_FOUND));

        EOrderStatus currentStatus = order.getStatus();
        EOrderStatus newStatus = EOrderStatus.valueOf(request.getStatus());

        // 2. Kiểm tra logic hủy đơn hàng
//    if (newStatus == EOrderStatus.CANCELED) {
//      if (!(currentStatus == EOrderStatus.PENDING_CONFIRMATION || currentStatus == EOrderStatus.CONFIRMED)) {
//        throw new ApplicationException(ErrorCode.CANT_CANCEL_ORDER);
//      }
//    }
        // 2. Cập nhật trạng thái mới
        switch (newStatus) {
            case PENDING_CONFIRMATION:
                if (currentStatus == EOrderStatus.DELIVERED || currentStatus == EOrderStatus.SHIPPING || currentStatus == EOrderStatus.CANCELED || currentStatus == EOrderStatus.CONFIRMED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                order.setStatus(newStatus);
                order.setPendingConfirmationDate(LocalDateTime.now());
                break;
            case CONFIRMED:
                if (currentStatus == EOrderStatus.SHIPPING || currentStatus == EOrderStatus.CANCELED || currentStatus == EOrderStatus.DELIVERED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                order.setStatus(newStatus);
                order.setConfirmedDate(LocalDateTime.now());
                break;
            case SHIPPING:
                if (currentStatus == EOrderStatus.CANCELED || currentStatus == EOrderStatus.DELIVERED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                order.setStatus(newStatus);
                order.setShippingDate(LocalDateTime.now());
                break;
            case DELIVERED:
                if (currentStatus == EOrderStatus.CANCELED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                order.setStatus(newStatus);
                order.setDeliveredDate(LocalDateTime.now());
                break;
            case CANCELED:
                if (currentStatus == EOrderStatus.DELIVERED) {
                    throw new ApplicationException(ErrorCode.CANT_CHANGE_STATUS_ORDER);
                }
                if (order.getConfirmedDate() == null) {
                    order.setConfirmedDate(LocalDateTime.now());
                }
                if (order.getShippingDate() == null) {
                    order.setShippingDate(LocalDateTime.now());
                }
                if (order.getDeliveredDate() == null) {
                    order.setDeliveredDate(LocalDateTime.now());
                }
                order.setStatus(newStatus);
                order.setCancelledDate(LocalDateTime.now());
                break;
        }


        // 3. Lưu trạng thái mới

        orderRepository.save(order);

        // 4. Tạo timeline phù hợp với trạng thái mới
//    OrderTimeline.OrderTimelineBuilder timelineBuilder = OrderTimeline.builder()
//            .createdAt(LocalDateTime.now())
//            .orderStatus(newStatus)
//            .order(order);
//
//    switch (newStatus) {
//      case PENDING_CONFIRMATION:
//        timelineBuilder
//                .name("Đơn hàng đã được tạo")
//                .description("Khách hàng xác nhận đơn hàng, chờ xác nhận.");
//        break;
//      case CONFIRMED:
//        timelineBuilder
//                .name("Đơn hàng đã được xác nhận")
//                .description("Đơn hàng đã được xác nhận bởi quản trị viên.");
//        break;
//      case SHIPPING:
//        timelineBuilder
//                .name("Đơn hàng đang được vận chuyển")
//                .description("Đơn hàng đã được giao cho đơn vị vận chuyển.");
//        break;
//      case DELIVERED:
//        timelineBuilder
//                .name("Đơn hàng đã giao thành công")
//                .description("Khách hàng đã nhận được đơn hàng.");
//        break;
//      case CANCELED:
//        timelineBuilder
//                .name("Đơn hàng đã bị hủy")
//                .description("Đơn hàng đã bị hủy bởi khách hàng hoặc quản trị viên.");
//        break;
//    }
//
//    orderTimelineRepository.save(timelineBuilder.build());
        long idUser = order.getUser().getUserId();
        simpMessagingTemplate.convertAndSend("/notifyOrderStatus/userId/" + idUser, "Trạng thái hóa đơn có id là " + orderId + " của khách hàng có id là " + idUser + " cập nhập từ admin thành công. Trạng thái mới: " + newStatus);

        return "Cập nhật trạng thái đơn hàng thành công";
    }

    @Override
    public TimelineOrderResponseDTO getTimelineOrder(Long orderId) {
        // Lấy danh sách timeline theo orderId, sắp xếp theo thời gian tăng dần
        List<OrderTimeline> timelines = orderTimelineRepository.findByOrderOrderIdOrderByCreatedAtAsc(orderId);

        // Map sang DTO và định dạng ngày tháng
        List<TimelineOrderResponseDTO.Timeline> dtoTimelines = timelines.stream()
                .map(t -> TimelineOrderResponseDTO.Timeline.builder()
                        .name(t.getName())
                        .description(t.getDescription())
                        .createdAt(t.getCreatedAt().format(FORMATTER))
                        .build())
                .collect(Collectors.toList());

        return TimelineOrderResponseDTO.builder()
                .timelines(dtoTimelines)
                .build();
    }

    @Override
    public Page<OrderDetailsResponseDTO> getFilteredOrders(Pageable pageable, OrderFilter filter) {
        Specification<Order> spec = OrderSpecifications.combineFilters(filter);
        Page<Order> ordersPage = orderRepository.findAll(spec, pageable);
        return ordersPage.map(orderMapper::toOrderDetailsResponseDTO);
    }

    @Override
    public List<StatusCountResponseDTO> getStatusCount() {
        List<StatusCountResponseDTO> list = new ArrayList<>();
        for (EOrderStatus status : EOrderStatus.values()) {
            Long count = orderRepository.countQualityOrderBaseOnStatus(status);
            StatusCountResponseDTO statusCountResponseDTO = new StatusCountResponseDTO();
            statusCountResponseDTO.setStatus(status.name());
            statusCountResponseDTO.setCount(count);
            list.add(statusCountResponseDTO);
        }
        for (ERefundStatus status : ERefundStatus.values()) {
            Long count = refundItemsRepository.countQualityRefundItemsBaseOnStatus(status);
            StatusCountResponseDTO statusCountResponseDTO = new StatusCountResponseDTO();
            statusCountResponseDTO.setStatus(status.name());
            statusCountResponseDTO.setCount(count);
            list.add(statusCountResponseDTO);
        }
        return list;
    }

    @Override
    public Page<OrderDetailsResponseDTO> filterOrdersForAdmin(Pageable pageable, OrderFilterRequest orderFilterRequest) {
        Page<Order> orders = orderRepository.findAll(
                OrderSpecification.filter(orderFilterRequest.getKeyword(), orderFilterRequest.getFromDate(), orderFilterRequest.getToDate(), orderFilterRequest.getStatus()),
                pageable
        );
        return orders.map(orderMapper::toOrderDetailsResponseDTO);
    }

    @Override
    public Page<OrderResponseDTO> getOrdersByStatus(Pageable pageable, String status) {
        Page<Order> order = orderRepository.findByStatusOrderByOrderIdDesc(Enum.valueOf(EOrderStatus.class, status), pageable);
        return order.map(orderMapper::toOrderResponseDTO);
    }

    public List<OrderItem> calculateBookItems(List<CartItemResponseDTO.BookItemResponseDTO> bookItems, Map<Long, Book> bookMap, Map<Long, Double> productDiscountMap, Order order, User user) {
        List<OrderItem> orderItems = new ArrayList<>();
        if (bookItems.size() == 0) {
            return orderItems;
        } else {
            for (CartItemResponseDTO.BookItemResponseDTO cartItem : bookItems) {
                Book book = bookMap.get(cartItem.getProductId());
                int quantity = cartItem.getQuantity();
                double discount = productDiscountMap.getOrDefault(book.getBookId(), 0.0);
                double price = book.getPrice();

                double finalPricePerItem = price * (1 - discount / 100.0);
                double totalFinalPrice = finalPricePerItem * quantity;

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setBook(book);
                orderItem.setQuantity(quantity);
                orderItem.setPrice(price);
                orderItem.setDiscountPercentage(discount);
                orderItem.setFinalPrice(totalFinalPrice);


                orderItems.add(orderItem);

            }


            return orderItems;
        }
    }

    public List<OrderItem> calculateRedeemRewardItems(List<CartItemResponseDTO.RewardItemResponseDTO> redeemRewardItems, RedeemRepository redeemRepository, Order order, User user) {
        List<OrderItem> orderItems = new ArrayList<>();
        if (redeemRewardItems.size() == 0) {
            return orderItems;
        } else {
            for (CartItemResponseDTO.RewardItemResponseDTO cartItem : redeemRewardItems) {
                RedeemReward redeemReward = redeemRepository.findByRewardId(cartItem.getProductId()).get();
                int quantity = cartItem.getQuantity();
                double price = redeemReward.getPrice();

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setRedeemReward(redeemReward);
                orderItem.setQuantity(quantity);
                orderItem.setPrice(price);
                orderItem.setFinalPrice(price * quantity);


                orderItems.add(orderItem);
            }
            return orderItems;
        }

    }

    private boolean isBookEligibleForDiscount(Book book, Discount discount) {
        if (book.getCategory() == null) {
            return false;
        }
        List<Long> allowedCategoryIds = discount.getDiscountCategories().stream()
                .map(dc -> dc.getCategory().getCategoryId())
                .collect(Collectors.toList());
        Category current = book.getCategory();
        while (current != null) {
            if (allowedCategoryIds.contains(current.getCategoryId())) {
                return true;
            }
            current = current.getParentCategory();
        }
        return false;

    }

    private void distributeDiscountToItems(List<OrderItem> items, double totalDiscountToDistribute, double totalBaseAmount) {
        double remainingDistribute = totalDiscountToDistribute;

        for (int i = 0; i < items.size(); i++) {
            OrderItem item = items.get(i);
            double share = 0.0;

            if (i == items.size() - 1) {
                // Item cuối cùng chịu phần lẻ còn lại
                share = remainingDistribute;
            } else {
                // Tính theo tỷ lệ trọng số: (Giá Item / Tổng Giá) * Tổng Giảm
                share = (item.getFinalPrice() / totalBaseAmount) * totalDiscountToDistribute;

                // Làm tròn 2 chữ số thập phân (nếu cần) hoặc giữ nguyên double
                // Ở đây giữ nguyên double cho chính xác, chỉ cẩn thận khi hiển thị
            }

            remainingDistribute -= share;

            // Cập nhật giá mới cho item
            double newPrice = Math.max(0, item.getFinalPrice() - share);
            item.setFinalPrice(newPrice);
        }
    }

    private void recordDiscountUsage(User user, Discount discount, List<UserDiscountUsage> usages) {
        UserDiscountUsage usage = new UserDiscountUsage();
        usage.setUser(user);
        usage.setDiscount(discount);
        usages.add(usage);
    }

    private void processUserPoints(User user, Order order, double totalAmount, PaymentMethod paymentMethod) {
        UserPoint userPoint = userPointRepository.findByUser_UserId(user.getUserId())
                .orElseGet(() -> createNewUserPoint(user)); // Nếu chưa có thì tạo mới

        List<UserPointHistory> histories = new ArrayList<>();

        // --- 1. XỬ LÝ THANH TOÁN BẰNG ĐIỂM (DEDUCTION) ---
        if (paymentMethod.getMethodName() == EPaymentMethod.WB_POINT) {
            if (userPoint.getTotalPoint() < totalAmount) {
                throw new ApplicationException(ErrorCode.NOT_ENOUGH_WB_POINT);
            }

            double oldPoint = userPoint.getTotalPoint();
            userPoint.setTotalPoint(oldPoint - totalAmount);

            // Lưu lịch sử trừ điểm
            UserPointHistory deductHistory = UserPointHistory.builder()
                    .userPoint(userPoint)
                    .pointsChange(-totalAmount) // Số âm
                    .description("Thanh toán đơn hàng #" + order.getOrderId())
                    .createdAt(LocalDateTime.now())
                    .build();
            histories.add(deductHistory);
        }

        // --- 2. XỬ LÝ TÍCH ĐIỂM (ACCUMULATION) ---
        // Chỉ tích điểm nếu đơn hàng > 0 và trạng thái hợp lệ.
        // Lưu ý: Thông thường tích điểm chỉ chạy khi đơn hàng "COMPLETED".
        // Nhưng nếu bạn muốn tích ngay lúc tạo ("Pending"), hãy dùng logic dưới đây:

        double pointsEarned = calculateEarnedPoints(totalAmount);

        if (pointsEarned > 0) {
            userPoint.setTotalPoint(userPoint.getTotalPoint() + pointsEarned);
            userPoint.setLifetimePoint(userPoint.getLifetimePoint() + pointsEarned);

            // Lưu lịch sử cộng điểm
            UserPointHistory earnHistory = UserPointHistory.builder()
                    .userPoint(userPoint)
                    .pointsChange(pointsEarned) // Số dương
                    .description("Tích điểm từ đơn hàng #" + order.getOrderId())
                    .createdAt(LocalDateTime.now())
                    .build();
            histories.add(earnHistory);

            // --- 3. XỬ LÝ NÂNG RANK (RANKING) ---
            checkAndUpgradeRank(userPoint);
        }

        // Save changes
        userPointRepository.save(userPoint);
        userPointHistoryRepository.saveAll(histories);
    }

    /**
     * Tính số điểm tích lũy được dựa trên giá trị đơn hàng
     */
    private double calculateEarnedPoints(double totalAmount) {
        // Ví dụ: Làm tròn xuống
        return Math.floor(totalAmount / EARN_POINT_RATE);
    }

    /**
     * Logic kiểm tra và nâng hạng thành viên
     */
    private void checkAndUpgradeRank(UserPoint userPoint) {
        double lifetime = userPoint.getLifetimePoint();
        EUserRank currentRank = userPoint.getUserRank();
        EUserRank newRank = currentRank;
        double nextRankTarget = 0.0;

        // Giả sử logic Rank:
        // BRONZE: 0 - 999
        // SILVER: 1000 - 4999
        // GOLD: 5000 - 9999
        // PLATINUM: 10000 -19999
//        DIAMOND: >= 20000

        if (lifetime >= 20000) {
            newRank = EUserRank.Diamond;
            nextRankTarget = 0.0; // Max rank
        } else if (lifetime >= 10000) {
            newRank = EUserRank.Platinum;
            nextRankTarget = 20000.0;
        } else if (lifetime >= 5000) {
            newRank = EUserRank.Gold;
            nextRankTarget = 10000.0;
        } else if (lifetime >= 1000) {
            newRank = EUserRank.Silver;
            nextRankTarget = 5000.0;
        } else {
            newRank = EUserRank.Bronze;
            nextRankTarget = 1000.0;
        }


        // Nếu rank thay đổi thì cập nhật thời gian
        if (newRank != currentRank) {
            userPoint.setUserRank(newRank);
            userPoint.setRankUpdatedAt(LocalDateTime.now());
            userPoint.setNextRankPoint(nextRankTarget);
        }
    }

    // tạo mới UserPoint cho user mới
    private UserPoint createNewUserPoint(User user) {
        return UserPoint.builder()
                .user(user)
                .totalPoint(0.0)
                .lifetimePoint(0.0)
                .userRank(EUserRank.Bronze)
                .nextRankPoint(1000.0) // Giả sử mốc Silver là 1000
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
