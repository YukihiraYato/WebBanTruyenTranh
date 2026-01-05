package nlu.com.app.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.CreateUserForAdminRequestDTO;
import nlu.com.app.dto.request.FilterUserDetailsRequestDTO;
import nlu.com.app.dto.request.ResetPasswordRequestDTO;
import nlu.com.app.dto.request.UpdateUserForAdminRequestDTO;
import nlu.com.app.dto.response.UserDetailsResponseDTO;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.IUserDetailsService;
import nlu.com.app.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/user")
@RequiredArgsConstructor
public class AdminUserController {
    private final IUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @GetMapping("/get-all")
    public AppResponse<Page<UserDetailsResponseDTO>> getAllByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role) {
        FilterUserDetailsRequestDTO request = FilterUserDetailsRequestDTO.builder()
                .keyword(keyword)
                .status(status)
                .role(role)
                .build();
        Page<UserDetailsResponseDTO> users = userDetailsService.filterUsers(request, page, size);
        return AppResponse.<Page<UserDetailsResponseDTO>>builder().result(users).build();
    }

    @PostMapping("/create")
    public AppResponse<UserDetailsResponseDTO> createNewUser(@Valid @RequestBody CreateUserForAdminRequestDTO request) {
        UserDetailsResponseDTO result = userDetailsService.createUser(request);

        return AppResponse.<UserDetailsResponseDTO>builder().result(result).message("Tạo tài khoản thành công").build();
    }

    @PutMapping("/{id}")
    public AppResponse<UserDetailsResponseDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserForAdminRequestDTO request) {

        UserDetailsResponseDTO result = userDetailsService.updateUser(id, request);

        return AppResponse.<UserDetailsResponseDTO>builder().result(result).message("Cập nhật tài khoản thành công").build();
    }

    @PutMapping("/reset-password")
    public AppResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        String username = SecurityUtils.getCurrentUsername();
        Long id = userRepository.findByUsername(username).get().getUserId();
        userDetailsService.resetPassword(id, request);

        return AppResponse.<Void>builder().message("Đổi mật khẩu thành công").build();
    }

}
