package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_search_history")
@Data
public class UserSearchHistory {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name ="keyword")
    private String keyword;
    @Column(name ="searched_at")
    private LocalDateTime searchedAt;
    @Column(name = "search_count")
    private Integer searchCount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
