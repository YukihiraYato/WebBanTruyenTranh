package nlu.com.app.repository;

import nlu.com.app.entity.Notifications;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public interface NotificationRepository extends JpaRepository<Notifications, Long> {
    List<Notifications> findByUser_UserId(Long userId);

    long countByUser_UserIdAndIsReadFalse(Long userId);
}
