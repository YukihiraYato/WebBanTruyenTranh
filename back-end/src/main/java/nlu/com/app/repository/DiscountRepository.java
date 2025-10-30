package nlu.com.app.repository;

import io.lettuce.core.dynamic.annotation.Param;
import nlu.com.app.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;
public interface DiscountRepository extends JpaRepository<Discount, Long> {
    @Query(value = """
    SELECT * 
    FROM discount d
    WHERE 
        d.start_date <= CURRENT_TIMESTAMP
        AND d.end_date >= CURRENT_TIMESTAMP
        AND d.use_count < d.usage_limit
        AND d.discount_id NOT IN (
            SELECT udu.discount_id
            FROM user_discount_usage udu
            WHERE udu.user_id = :userId
        )
    """, nativeQuery = true)
    List<Discount> findAvailableDiscountsForUser(@Param("userId") Long userId);
  List<Discount> findAllBy();
  Optional<Discount> findByDiscountId(Long discountId);
}
