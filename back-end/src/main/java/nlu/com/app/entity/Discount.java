package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import nlu.com.app.constant.EDiscountTarget;
import nlu.com.app.constant.EDiscountType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "discount")
@Data
public class Discount {
    @Id
    @Column(name = "discount_id")
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long discountId;
    @Column(name = "code")
    private String code;
    @Column(name = "title")
    private String title;
    @Column(name = "description")
    private String description;
    @Column(name = "discount_type")
    @Enumerated(EnumType.STRING)
    private EDiscountType discountType;
    @Column(name = "value")
    private  Double value;
    @Column(name = "target_type")
    @Enumerated(EnumType.STRING)
    private EDiscountTarget targetType;
    @Column(name = "min_order_amount")
    private  Double minOrderAmount;
    @Column(name = "usage_limit")
    private int usageLimit;
    @Column (name = "use_count")
    private int useCount;
    @Column(name = "start_date")
    private LocalDate startDate;
    @Column(name = "end_date")
    private LocalDate endDate;
    @Column(name = "is_active")
    private Boolean isActive;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserDiscountUsage> userUsages = new ArrayList<>();

    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiscountOrders> discountOrders = new ArrayList<>();

    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiscountBooks> discountBooks = new ArrayList<>();



    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
