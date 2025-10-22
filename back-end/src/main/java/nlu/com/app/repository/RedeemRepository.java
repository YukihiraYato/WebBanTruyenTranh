package nlu.com.app.repository;

import nlu.com.app.entity.RedeemReward;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RedeemRepository extends JpaRepository<RedeemReward, Long> {
    List<RedeemReward> findAllBy();
    Optional<RedeemReward> findByRewardId(Long rewardId);
}
