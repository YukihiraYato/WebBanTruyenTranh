package nlu.com.app.repository;

import nlu.com.app.constant.UserRole;
import nlu.com.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    List<User> findByRole(UserRole role);
    Optional<User> findByUserId(Long userId);
    User findByEmail(String email);
    @Query("select u.userId from User u")
    List<Long> findAllUserIds();

}
