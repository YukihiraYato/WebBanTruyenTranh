package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "discount_product")
@Data
public class DiscountBooks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_book_id")
    long discountProductId;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "book_id")
    Book book;
    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "discount_id")
    Discount discount;
}
