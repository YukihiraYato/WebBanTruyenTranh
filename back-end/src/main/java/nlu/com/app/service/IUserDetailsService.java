package nlu.com.app.service;

import nlu.com.app.dto.request.CreateUserForAdminRequestDTO;
import nlu.com.app.dto.request.FilterUserDetailsRequestDTO;
import nlu.com.app.dto.request.ResetPasswordRequestDTO;
import nlu.com.app.dto.request.UpdateUserForAdminRequestDTO;
import nlu.com.app.dto.response.UserDetailsResponseDTO;
import nlu.com.app.entity.UserDetails;
import org.springframework.data.domain.Page;

public interface IUserDetailsService {
    UserDetails getUserDetailsByUserId(Long userId);

    boolean updateUserDetails(UserDetails userDetails, Long userId);

    boolean addUserDetails(UserDetails userDetails, Long userId);

    UserDetailsResponseDTO getUserDetails(Long userId);

    Page<UserDetailsResponseDTO> filterUsers(FilterUserDetailsRequestDTO request, int page, int size);

    UserDetailsResponseDTO createUser(CreateUserForAdminRequestDTO request);

    UserDetailsResponseDTO updateUser(Long userId, UpdateUserForAdminRequestDTO request);

    void resetPassword(Long userId, ResetPasswordRequestDTO request);
}
