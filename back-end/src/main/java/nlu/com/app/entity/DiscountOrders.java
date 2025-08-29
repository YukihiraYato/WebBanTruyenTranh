package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "discount_orders")
@Data
public class DiscountOrders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_order_id")
    private Long discountOrderId;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "order_id")

    private Order order;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "discount_id")
    private Discount discount;
}
