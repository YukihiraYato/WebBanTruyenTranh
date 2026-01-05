package nlu.com.app.repository;

import nlu.com.app.entity.RedeemReward;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

// Cần phải import JpaSpecificationExecutor
public interface RedeemRepository extends JpaRepository<RedeemReward, Long>, JpaSpecificationExecutor<RedeemReward> {
    List<RedeemReward> findAllBy();

    Optional<RedeemReward> findByRewardId(Long rewardId);

    Page<RedeemReward> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

}
