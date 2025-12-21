package nlu.com.app.repository;

import nlu.com.app.entity.Discount;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {

    long countByUserAndDiscount(User user, Discount discount);

    Optional<UserCoupon> findByUser_UserIdAndDiscount_DiscountIdAndIsUsedFalse(Long userId, Long discountId);
}
