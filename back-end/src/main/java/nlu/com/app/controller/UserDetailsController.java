package nlu.com.app.controller;

import lombok.Builder;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.UserDetailsDTO;
import nlu.com.app.dto.response.UserDetailsResponseDTO;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserDetails;
import nlu.com.app.exception.ApplicationException;
import nlu.com.app.exception.ErrorCode;
import nlu.com.app.service.IUserDetailsService;
import nlu.com.app.service.impl.UserService;
import nlu.com.app.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-details")
@RequiredArgsConstructor
public class UserDetailsController {
    private final IUserDetailsService userDetailsService;
    private final UserService userService;

    @PostMapping("/add")
    public AppResponse<String> add(@RequestBody UserDetailsDTO userDetails) {
        User user = getUser();
        try {
            boolean result = userDetailsService.addUserDetails(UserDetails.builder()
                   .fullname(userDetails.getFullName())
                   .dob(userDetails.getDateOfBirth())
                   .phoneNum(userDetails.getPhoneNum())
                   .user(user)
                   .build(), user.getUserId());
           return AppResponse.<String>builder().result("Add success").build();
       }catch (Exception ex) {
            ex.printStackTrace();
           return AppResponse.<String>builder()
                   .result("Thêm chi tiết thông tin người dùng thất bại: " + ex.getMessage())
                   .build();
       }
    }

    @GetMapping
    public AppResponse<UserDetailsResponseDTO> getUserDetails() {
        User user = getUser();
        UserDetails userDetails = userDetailsService.getUserDetailsByUserId(user.getUserId());
        UserDetailsResponseDTO userDetailsDTO =  UserDetailsResponseDTO.builder()
                .fullName(userDetails.getFullname())
                .dateOfBirth(userDetails.getDob())
                .phoneNum(userDetails.getPhoneNum())
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
        return AppResponse.<UserDetailsResponseDTO>builder().result(userDetailsDTO).build();
    }

    @PutMapping
    public AppResponse<String> update(@RequestBody UserDetailsDTO userDetails) {
        User user = getUser();
        boolean result = userDetailsService.updateUserDetails(UserDetails.builder()
                .fullname(userDetails.getFullName())
                .dob(userDetails.getDateOfBirth())
                .phoneNum(userDetails.getPhoneNum())
                .user(user)
                .build(), user.getUserId());
        return AppResponse.<String>builder().result("Update success").build();
    }

    private User getUser() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }
        User user = userService.getUserByUserName(username);
        return user;
    }
}
