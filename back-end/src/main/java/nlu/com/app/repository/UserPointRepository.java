package nlu.com.app.repository;

import nlu.com.app.entity.User;
import nlu.com.app.entity.UserPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface UserPointRepository extends JpaRepository<UserPoint, Long> {
    List<UserPoint> findAllBy();
    Optional<UserPoint> findByUser_UserId(Long userId);
}
