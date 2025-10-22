package nlu.com.app.entity;

import org.hibernate.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_book_ratings")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBookRatingView {

    @Id
    private Long id; // cột id ảo từ view

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "item_id")
    private Long itemId;

    private Integer rating;

    @Column(name = "rating_time")
    private LocalDateTime ratingTime;
}
