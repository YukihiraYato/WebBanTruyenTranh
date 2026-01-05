package nlu.com.app.repository;

import io.lettuce.core.dynamic.annotation.Param;
import nlu.com.app.constant.UserRole;
import nlu.com.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByUsername(String username);

    List<User> findByRole(UserRole role);

    Optional<User> findByUserId(Long userId);

    User findByEmail(String email);

    @Query("select u.userId from User u")
    List<Long> findAllUserIds();

    // Đếm khách hàng đăng ký trong tháng
    @Query("SELECT COUNT(u) FROM User u " +
            "WHERE u.role = :role " +
            "AND MONTH(u.created_date) = :month " +
            "AND YEAR(u.created_date) = :year")
    Long countNewCustomers(@Param("month") int month,
                           @Param("year") int year,
                           @Param("role") UserRole role);

    long countByRole(UserRole role);


}
