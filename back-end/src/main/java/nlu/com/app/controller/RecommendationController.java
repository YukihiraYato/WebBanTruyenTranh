package nlu.com.app.controller;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.response.PageBookResponseDTO;
import nlu.com.app.dto.response.RecommendationDTO;
import nlu.com.app.entity.User;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.RecommendationService;
import nlu.com.app.util.SecurityUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/recommend")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    // Lấy toàn bộ gợi ý cho tất cả user
//    @GetMapping
//    public AppResponse<List<RecommendationDTO>> getAll() throws IOException {
//        try{
//            List<RecommendationDTO> list = recommendationService.getAllRecommendations();
//            return AppResponse.<List<RecommendationDTO>>builder().result(list).build();
//        }catch (Exception e){
//            return AppResponse.<List<RecommendationDTO>>builder().result(null).message("Lỗi khi lấy gợi ý").build();
//        }
//    }

    // Lấy gợi ý cho 1 user cụ thể
    @GetMapping("")
    public AppResponse<List<PageBookResponseDTO>> getForUser( @RequestParam(defaultValue = "5") int recommendBook) throws IOException {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username).get();
        Long userId = user.getUserId();
        RecommendationDTO list = recommendationService.getRecommendationsForUser(userId,recommendBook);
        List<Long> bookId = list.getRecommendations();
        List<PageBookResponseDTO> books = recommendationService.getBookFromRecommendationId(bookId);
        return AppResponse.<List<PageBookResponseDTO>>builder().result(books).build();
    }
}
