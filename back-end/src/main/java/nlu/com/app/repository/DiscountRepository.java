package nlu.com.app.repository;

import nlu.com.app.entity.Discount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DiscountRepository extends JpaRepository<Discount, Long> {
    /**
     * --- QUERY 1: LẤY MÃ CÓ THỂ SỬ DỤNG (CHECKOUT) ---
     * Bao gồm:
     * 1. Mã đã đổi nằm trong ví (UserCoupon).
     * 2. Mã miễn phí (Public) dành cho Rank của user hoặc cho người mới (Global).
     */
    @Query(value = """
            SELECT d.*
            FROM discount d
            LEFT JOIN user_point up ON up.user_id = :userId
            WHERE
                d.is_active = true
                AND d.start_date <= CURRENT_DATE
                AND d.end_date >= CURRENT_DATE
                AND (
                    -- TRƯỜNG HỢP 1: Đã đổi bằng điểm / Được tặng (Nằm trong ví UserCoupon)
                    EXISTS (
                        SELECT 1
                        FROM user_coupon uc
                        WHERE uc.discount_id = d.discount_id
                          AND uc.user_id = :userId
                          AND uc.is_used = false
                          AND (uc.expired_at IS NULL OR uc.expired_at >= CURRENT_TIMESTAMP)
                    )
            
                    OR
            
                    -- TRƯỜNG HỢP 2: Mã Free (Public) dành cho Rank hoặc User mới (Global)
                    (
                        (d.point_cost IS NULL OR d.point_cost = 0) -- Mã miễn phí
            
                        -- Logic Rank hoặc User mới:
                        -- Nếu rank_for_vip_customer IS NULL -> Mã cho người mới/tất cả (Global)
                        -- Nếu rank_for_vip_customer = up.user_rank -> Mã riêng cho Rank đó
                        AND (
                            d.rank_for_vip_customer IS NULL 
                            OR 
                            (up.user_rank IS NOT NULL AND d.rank_for_vip_customer = up.user_rank)
                        )
            
                        -- Kiểm tra còn lượt dùng (Global Limit)
                        AND (d.usage_limit IS NULL OR d.use_count < d.usage_limit)
            
                        -- Kiểm tra giới hạn lượt dùng của user (Per-User Limit)
                        -- (Chặn trường hợp mã Welcome chỉ cho dùng 1 lần mà user dùng rồi)
                        AND (
                             d.usage_limit_per_user IS NULL 
                             OR d.usage_limit_per_user = 0
                             OR (
                                (
                                    SELECT COUNT(*)
                                    FROM user_discount_usage udu
                                    WHERE udu.discount_id = d.discount_id
                                      AND udu.user_id = :userId
                                ) < d.usage_limit_per_user
                             )
                        )
                    )
                )
            """, nativeQuery = true)
    List<Discount> findAvailableDiscountsForUser(@Param("userId") Long userId);

    /**
     * --- QUERY 2: LẤY MÃ ĐỂ ĐỔI ĐIỂM (REDEEM PAGE) ---
     * Chỉ bán: Mã Global (No Rank), 1 người/1 cái, Có tốn điểm.
     */
    @Query(
            value = """
                    SELECT d.*
                    FROM discount d
                    WHERE
                        d.is_active = true
                        AND d.start_date <= CURRENT_DATE
                        AND d.end_date >= CURRENT_DATE
                    
                        -- 1. Phải tốn điểm (Logic đổi điểm)
                        AND d.point_cost > 0
                    
                        -- 2. Chỉ lấy mã Global (Không yêu cầu Rank)
                        AND d.rank_for_vip_customer IS NULL
                    
                        -- 3. Bắt buộc giới hạn mỗi người chỉ 1 cái (Theo yêu cầu)
                        AND d.usage_limit_per_user = 1
                    
                        -- 4. Kiểm tra Kho tổng (Còn hàng)
                        AND d.usage_limit > 0 
                        AND d.use_count < d.usage_limit
                    
                        -- 5. User chưa từng đổi (Kiểm tra trong UserCoupon)
                        -- Vì limit = 1 nên nếu đã có trong UserCoupon (dù dùng rồi hay chưa) cũng không được đổi nữa
                        AND NOT EXISTS (
                            SELECT 1
                            FROM user_coupon uc
                            WHERE uc.discount_id = d.discount_id
                              AND uc.user_id = :userId
                        )
                    """,
            countQuery = """
                    SELECT COUNT(*)
                    FROM discount d
                    WHERE
                        d.is_active = true
                        AND d.start_date <= CURRENT_DATE
                        AND d.end_date >= CURRENT_DATE
                        AND d.point_cost > 0
                        AND d.rank_for_vip_customer IS NULL
                        AND d.usage_limit_per_user = 1
                        AND d.usage_limit > 0 
                        AND d.use_count < d.usage_limit
                        AND NOT EXISTS (
                            SELECT 1
                            FROM user_coupon uc
                            WHERE uc.discount_id = d.discount_id
                              AND uc.user_id = :userId
                        )
                    """,
            nativeQuery = true
    )
    Page<Discount> findRedeemableDiscounts(@Param("userId") Long userId, Pageable pageable);

    // --- DÀNH CHO ADMIN (ADMIN SIDE) ---

    /**
     * 1. Lấy toàn bộ Discount chưa hết hạn (để Admin quản lý các campaign đang chạy).
     * Sắp xếp theo ngày kết thúc tăng dần (cái nào sắp hết hạn hiện lên trước).
     */
    @Query("SELECT d FROM Discount d WHERE d.endDate >= CURRENT_DATE ORDER BY d.endDate ASC")
    List<Discount> findAllActiveDiscounts();

    /**
     * 2. Lấy toàn bộ Discount (bao gồm cả hết hạn) nhưng có phân trang
     * Để Admin xem lịch sử hoặc thống kê.
     */
    @Query("SELECT d FROM Discount d ORDER BY d.createdAt DESC")
    Page<Discount> findAllDiscounts(Pageable pageable);

    // Các hàm tìm kiếm cơ bản
    List<Discount> findAllBy();

    Optional<Discount> findByDiscountId(Long discountId);

    Optional<Discount> findByCode(String code);
}