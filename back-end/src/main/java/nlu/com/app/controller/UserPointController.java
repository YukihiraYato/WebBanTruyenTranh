package nlu.com.app.controller;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.response.UserPointResponseDTO;
import nlu.com.app.entity.UserPoint;
import nlu.com.app.repository.UserPointRepository;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user-point")
@RequiredArgsConstructor
public class UserPointController {
    private final UserPointRepository userPointRepository;

    @GetMapping("/get/user")
    public AppResponse<UserPointResponseDTO> getUserPointByUserId(@RequestParam Long userId){
       try {
           UserPoint userPoint = userPointRepository.findByUser_UserId(userId).get();
           UserPointResponseDTO userPointResponseDTO = new UserPointResponseDTO();
           userPointResponseDTO.setUserPointId(userPoint.getUserPointId());
           userPointResponseDTO.setTotalPoint(userPoint.getTotalPoint());
           userPointResponseDTO.setUserRank(userPoint.getUserRank());
           userPointResponseDTO.setUserId(userPoint.getUser().getUserId());
           return AppResponse.<UserPointResponseDTO>builder().result(userPointResponseDTO).build();
       } catch (Exception e) {
           e.printStackTrace();
           return AppResponse.<UserPointResponseDTO>builder().code(9999).result(null).message("Lỗi lấy user point").build();
       }
    }
}
