package nlu.com.app.controller;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.UserSearchHistoryRequest;
import nlu.com.app.dto.response.UserSearchHistoryResponse;
import nlu.com.app.entity.User;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.SearchHistoryService;
import nlu.com.app.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search-history")
@RequiredArgsConstructor
public class UserSearchHistoryController {

    private final SearchHistoryService service;
    private final UserRepository userRepository;

    // 🟢 POST /api/search-history  => Lưu keyword
    @PostMapping("/save")
    public ResponseEntity<?> saveKeyword(@RequestBody UserSearchHistoryRequest userSearchHistoryRequest) {
       try{
           String username = SecurityUtils.getCurrentUsername();
           User user = userRepository.findByUsername(username).orElse(null);
           service.saveSearchKeyword(user.getUserId(), userSearchHistoryRequest.getKeyword());
           return ResponseEntity.ok(Map.of("message", "Saved"));
       } catch (Exception e) {
           return ResponseEntity.badRequest().body("Lỗi khi lưu keyword");
       }
    }

    // 🟢 GET /api/search-history => Lấy 10 keyword gần nhất
    @GetMapping("/get")
    public AppResponse<List<UserSearchHistoryResponse>> getRecent() {
       try{
           String username = SecurityUtils.getCurrentUsername();
           User user = userRepository.findByUsername(username).orElse(null);
           List<UserSearchHistoryResponse> histories = service.getRecentSearches(user.getUserId());
           return AppResponse.<List<UserSearchHistoryResponse>>builder().result(histories).build();
       } catch (Exception e) {
           return AppResponse.<List<UserSearchHistoryResponse>>builder().result(null).code(9999).message("Có lỗi khi lấy keyword search của nguười dùng").build();
       }
    }
    @PutMapping("/delete")
    public ResponseEntity<?> deleteKeyword(@RequestBody UserSearchHistoryRequest userSearchHistoryRequest) {
        try{
            String username = SecurityUtils.getCurrentUsername();
            User user = userRepository.findByUsername(username).orElse(null);
            service.deleteSearchHistory(user.getUserId(), userSearchHistoryRequest.getKeyword());
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa keyword");
        }
    }
}
