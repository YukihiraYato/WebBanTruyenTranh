package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "notification")
public class Notifications {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    // Nếu message dài, nên dùng @Column(columnDefinition = "TEXT") để không bị lỗi giới hạn 255 ký tự
    private String message;

    @Column(name = "is_read") // Đặt tên cột rõ ràng trong DB
    private boolean isRead = false; // 2. Gán mặc định là false

    @CreationTimestamp // 3. Tự động lấy giờ hiện tại khi lưu, khỏi cần set tay
    @Column(name = "create_date", updatable = false)
    private LocalDateTime createDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // 4. Chỉ định rõ tên cột khóa ngoại
    private User user;
}