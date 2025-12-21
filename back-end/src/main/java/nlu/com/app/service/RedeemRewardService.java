package nlu.com.app.service;

import nlu.com.app.dto.response.DiscountResponseDTO;
import nlu.com.app.dto.response.RedeemRewardResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface RedeemRewardService {
    void initData();

    Page<RedeemRewardResponseDTO> getRedeemRewards(int page, int size);

    Page<RedeemRewardResponseDTO> getRedeemRewardsByFilter(int page, int size, String material, String origin, String rangePrice, String keyword);

    Page<RedeemRewardResponseDTO> searchRedeemRewards(int page, int size, String keyword);

    Optional<RedeemRewardResponseDTO> getRedeemRewardById(long redeemRewardId);

    Page<DiscountResponseDTO> getAllRedeemableDiscounts(long userId, Pageable pageable);
}
