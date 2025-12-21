package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nlu.com.app.constant.EUserRank;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_point")
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_point_id")
    private Long userPointId;

    // Điểm hiện tại (có thể trừ khi đổi quà)
    @Column(name = "total_point")
    private Double totalPoint;

    // Điểm tích lũy trọn đời (không bao giờ giảm)
    @Column(name = "lifetime_point")
    private Double lifetimePoint;

    // Rank hiện tại
    @Column(name = "user_rank")
    @Enumerated(EnumType.STRING)
    private EUserRank userRank;

    // Điểm cần để lên rank tiếp theo
    @Column(name = "next_rank_point")
    private Double nextRankPoint;

    // Thời điểm user được nâng rank
    @Column(name = "rank_updated_at")
    private LocalDateTime rankUpdatedAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "userPoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserPointHistory> userPointHistories = new ArrayList<>();
}

