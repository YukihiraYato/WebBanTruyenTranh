package nlu.com.app.repository;

import nlu.com.app.constant.ERefundStatus;
import nlu.com.app.entity.RefundItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefundItemsRepository extends JpaRepository<RefundItems, Long> {
    Optional<RefundItems> findByOrder_OrderId(Long orderItemId);

    @Query("SELECT COUNT(o) FROM RefundItems o WHERE o.status = :status")
    Long countQualityRefundItemsBaseOnStatus(ERefundStatus status);
}
