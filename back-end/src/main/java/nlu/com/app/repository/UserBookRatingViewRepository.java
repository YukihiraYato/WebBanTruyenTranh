package nlu.com.app.repository;

import nlu.com.app.entity.UserBookRatingView;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface UserBookRatingViewRepository extends JpaRepository<UserBookRatingView, Long> {
    List<UserBookRatingView> findByUserId(Long userId);
}
