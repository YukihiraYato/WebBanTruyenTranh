package nlu.com.app.service;

import nlu.com.app.dto.response.RedeemRewardResponseDTO;
import org.springframework.data.domain.Page;

import java.util.Optional;

public interface RedeemRewardService {
    public void initData();
    public Page<RedeemRewardResponseDTO> getRedeemRewards(int page, int size);
    public Page<RedeemRewardResponseDTO> getRedeemRewardsByFilter(int page, int size, String material, String origin, String rangePrice, String keyword);
    public Page<RedeemRewardResponseDTO> searchRedeemRewards(int page, int size, String keyword);
    public Optional<RedeemRewardResponseDTO> getRedeemRewardById(long redeemRewardId);
}
