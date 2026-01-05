package nlu.com.app.repository;

import nlu.com.app.constant.EOrderStatus;
import nlu.com.app.entity.Order;
import nlu.com.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author VuLuu
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByOrderId(long orderId);

    Page<Order> findAllByUserOrderByOrderIdDesc(User user, Pageable pageable);

    List<Order> findByStatus(EOrderStatus status);

    Page<Order> findByStatusOrderByOrderIdDesc(EOrderStatus status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE MONTH(o.deliveredDate) = :month AND YEAR(o.deliveredDate) = :year and o.status = :status")
    int countByOrderDateMonthAndYear(@Param("month") int month, @Param("year") int year, @Param("status") EOrderStatus status);

    @Query("SELECT o FROM Order o " +
            "WHERE o.status = :status " +
            "AND MONTH(o.deliveredDate) = :month " +
            "AND YEAR(o.deliveredDate) = :year " +
            "ORDER BY o.deliveredDate DESC")
    List<Order> findRecentOrdersInMonth(@Param("status") EOrderStatus status,
                                        @Param("month") int month,
                                        @Param("year") int year,
                                        Pageable pageable);

    // Đếm số đơn hàng đã giao thành công
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.userId = :userId AND o.status = 'DELIVERED'")
    int countDeliveredOrdersByUserId(@Param("userId") Long userId);

    // Tổng chi tiêu các đơn đã giao thành công
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.user.userId = :userId AND o.status = 'DELIVERED'")
    Double sumDeliveredTotalAmountByUserId(@Param("userId") Long userId);

    // Tần suất mua hàng theo tháng (chỉ tính đơn đã giao thành công)
    @Query("SELECT FUNCTION('DATE_FORMAT', o.deliveredDate, '%Y-%m') as month, SUM(o.totalAmount) " +
            "FROM Order o WHERE o.user.userId = :userId AND o.status = 'DELIVERED' " +
            "GROUP BY FUNCTION ('DATE_FORMAT', o.deliveredDate, '%Y-%m') ORDER BY FUNCTION ('DATE_FORMAT', o.deliveredDate, '%Y-%m')")
    List<Object[]> sumDeliveredAmountGroupByMonth(@Param("userId") Long userId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countQualityOrderBaseOnStatus(EOrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.status = :status AND YEAR(o.deliveredDate) = :year")
    List<Order> findByStatusAndYear(@Param("status") EOrderStatus status, @Param("year") int year);

    Long countByStatus(EOrderStatus status);

    // 1. Tính tổng doanh thu theo tháng/năm
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
            "WHERE o.status = :status " +
            "AND MONTH(o.deliveredDate) = :month " +
            "AND YEAR(o.deliveredDate) = :year")
    Long sumRevenueByMonth(@Param("month") int month,
                           @Param("year") int year,
                           @Param("status") EOrderStatus status);

    // 2. Đếm số lượng đơn hàng theo tháng/năm
    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.status = :status " +
            "AND MONTH(o.deliveredDate) = :month " +
            "AND YEAR(o.deliveredDate) = :year")
    Long countOrdersByMonth(@Param("month") int month,
                            @Param("year") int year,
                            @Param("status") EOrderStatus status);


    @Query("SELECT o FROM Order o " +
            "WHERE o.status = :status " +
            "AND MONTH(o.deliveredDate) = :month " +
            "AND YEAR(o.deliveredDate) = :year")
    List<Order> findByStatusAndMonth(@Param("status") EOrderStatus status,
                                     @Param("month") int month,
                                     @Param("year") int year);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status")
    Long sumTotalRevenue(@Param("status") EOrderStatus status);
}
