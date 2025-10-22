package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_point_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPointHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ===== Quan hệ tới order (có thể null) =====
    @Column(name = "order_id")
    private Long orderId;

    // ===== Số điểm thay đổi (có thể âm hoặc dương) =====
    @Column(name = "points_change", nullable = false)
    private Integer pointsChange;

    // ===== Mô tả lý do thay đổi điểm =====
    @Column(name = "description", length = 255)
    private String description;

    // ===== Thời điểm tạo =====
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;


    // ===== Quan hệ tới user =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
