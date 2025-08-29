package nlu.com.app.entity;

import jakarta.persistence.*;
import jdk.jfr.Enabled;
import lombok.Data;

@Entity
@Table(name = "discount_categories")
@Data
public class DiscountCategories {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_category_id")
     Long discountCategoryId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
     Category category;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id")
     Discount discount;
}
