package nlu.com.app.service;

import nlu.com.app.dto.response.RedeemRewardResponseDTO;
import org.springframework.data.domain.Page;

public interface RedeemRewardService {
    public void initData();
    public Page<RedeemRewardResponseDTO> getRedeemRewards(int page, int size);
}
