package nlu.com.app.controller;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.response.RedeemRewardResponseDTO;
import nlu.com.app.service.RedeemRewardService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/filter")
    public AppResponse<Page<RedeemRewardResponseDTO>> getAllByPageAndFilter(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
                                                                            @RequestParam (defaultValue = "") String material,
                                                                            @RequestParam (defaultValue = "") String origin,
                                                                            @RequestParam (defaultValue = "") String rangePrice,
                                                                            @RequestParam (defaultValue = "") String keyword) {

        Page<RedeemRewardResponseDTO> redeemRewardResponseDTOPage = redeemRewardService.getRedeemRewardsByFilter(page, size, material, origin, rangePrice, keyword);
        return AppResponse.<Page<RedeemRewardResponseDTO>>builder()
                .result(redeemRewardResponseDTOPage)
                .build();
    }
    @GetMapping("/search")
    public AppResponse<Page<RedeemRewardResponseDTO>> getAllByPageAndFilter(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
                                                                            @RequestParam String keyword) {
        Page<RedeemRewardResponseDTO> redeemRewardResponseDTOPage = redeemRewardService.searchRedeemRewards(page, size, keyword);
        return AppResponse.<Page<RedeemRewardResponseDTO>>builder()
                .result(redeemRewardResponseDTOPage)
                .build();
    }
    @GetMapping("/{redeemRewardId}")
    public AppResponse<RedeemRewardResponseDTO> getRedeemRewardById(@PathVariable long redeemRewardId) {
        return AppResponse.<RedeemRewardResponseDTO>builder()
                .result(redeemRewardService.getRedeemRewardById(redeemRewardId).get())
                .build();
    }


}
