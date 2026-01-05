package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nlu.com.app.constant.ERefundStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "refund_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundItems {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refund_item_id")
    private Long refundItemId;

    // Lý do hoàn trả (requireRefund của bạn)
    @Column(name = "reason", columnDefinition = "TEXT", nullable = false)
    private String reason;

    // Ghi chú của Admin
    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;


    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ERefundStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;


    @OneToMany(mappedBy = "refundRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RefundImage> images = new ArrayList<>();


    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
