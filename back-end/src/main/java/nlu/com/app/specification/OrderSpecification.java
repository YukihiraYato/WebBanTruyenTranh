package nlu.com.app.specification;


import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import nlu.com.app.constant.EOrderStatus;
import nlu.com.app.constant.ERefundStatus;
import nlu.com.app.entity.Order;
import nlu.com.app.entity.RefundItems;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {
    public static Specification<Order> filter(
            String keyword,
            LocalDate fromDate,
            LocalDate toDate,
            String statusStr // <-- Tham số mới: Status dạng chuỗi (để linh hoạt)
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Keyword search (Giữ nguyên logic cũ)
            if (keyword != null && !keyword.isBlank()) {
                List<Predicate> keywordPredicates = new ArrayList<>();
                if (keyword.matches("\\d+")) {
                    keywordPredicates.add(cb.equal(root.get("orderId"), Long.valueOf(keyword)));
                }
                keywordPredicates.add(
                        cb.like(cb.lower(root.get("user").get("username")), "%" + keyword.toLowerCase() + "%")
                );
                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
            }

            // 2. Date range (Giữ nguyên logic cũ)
            if (fromDate != null && toDate != null) {
                predicates.add(cb.between(root.get("pendingConfirmationDate"), fromDate.atStartOfDay(), toDate.atTime(23, 59, 59)));
            }

            // 3. LOGIC MỚI: Xử lý Status đa hệ (Order vs Refund)
            if (statusStr != null && !statusStr.isBlank()) {

                // Kiểm tra xem statusStr có phải là EOrderStatus không
                EOrderStatus orderStatus = null;
                try {
                    orderStatus = EOrderStatus.valueOf(statusStr);
                } catch (IllegalArgumentException e) {
                    // Không phải OrderStatus, bỏ qua
                }

                // Kiểm tra xem statusStr có phải là ERefundStatus không
                ERefundStatus refundStatus = null;
                try {
                    refundStatus = ERefundStatus.valueOf(statusStr);
                } catch (IllegalArgumentException e) {
                    // Không phải RefundStatus, bỏ qua
                }

                if (orderStatus != null) {
                    // ==> Case A: Lọc theo trạng thái Đơn hàng (Order Table)
                    predicates.add(cb.equal(root.get("status"), orderStatus));

                } else if (refundStatus != null) {
                    // ==> Case B: Lọc theo trạng thái Hoàn tiền (Join RefundItems Table)
                    // Vì RefundItems có quan hệ OneToOne với Order và mappedBy bên RefundItems (có order_id),
                    // nhưng trong entity Order không có field trỏ ngược lại RefundItems (theo code bạn gửi).
                    // -> Chúng ta phải dùng Subquery hoặc Join từ root nếu có quan hệ 2 chiều.

                    // Giả sử Order KHÔNG có List<RefundItems> hay field refundItem (như entity bạn gửi):
                    // Cách tốt nhất là dùng SUBQUERY: "Tìm Order có ID nằm trong danh sách OrderID của bảng RefundItems thỏa mãn status"

                    Subquery<Long> refundSubquery = query.subquery(Long.class);
                    Root<RefundItems> refundRoot = refundSubquery.from(RefundItems.class);

                    // Select order_id từ bảng RefundItems
                    refundSubquery.select(refundRoot.get("order").get("orderId"));

                    // Điều kiện: status của RefundItem trùng với status truyền vào
                    refundSubquery.where(cb.equal(refundRoot.get("status"), refundStatus));

                    // Main query: Order.orderId IN (Subquery)
                    predicates.add(root.get("orderId").in(refundSubquery));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
