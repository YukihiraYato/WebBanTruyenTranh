package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
        name = "user_discount_usage",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "discount_id"}))
@Data
public class UserDiscountUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nhiều usage có thể thuộc về cùng 1 user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Nhiều usage có thể thuộc cùng 1 discount
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id", nullable = false)
    private Discount discount;
}
