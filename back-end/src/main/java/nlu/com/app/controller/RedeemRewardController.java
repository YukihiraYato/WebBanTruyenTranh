package nlu.com.app.controller;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.response.RedeemRewardResponseDTO;
import nlu.com.app.service.RedeemRewardService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/redeem-reward")
public class RedeemRewardController {
    private final RedeemRewardService redeemRewardService;

    @GetMapping
    public AppResponse<Page<RedeemRewardResponseDTO>> getAllByPage(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return AppResponse.<Page<RedeemRewardResponseDTO>>builder()
                .result(redeemRewardService.getRedeemRewards(page, size))
                .build();
    }

}
