package nlu.com.app.service.impl;

import lombok.RequiredArgsConstructor;
import nlu.com.app.constant.UserRole;
import nlu.com.app.dto.request.LoginUserDTO;
import nlu.com.app.dto.request.RegisterUserDTO;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserDetails;
import nlu.com.app.exception.ApplicationException;
import nlu.com.app.exception.ErrorCode;
import nlu.com.app.mapper.UserMapper;
import nlu.com.app.repository.UserDetailsRepository;
import nlu.com.app.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsRepository userDetailsRepository;

    @Transactional
    public String registerUser(RegisterUserDTO requestDTO) {
        // check if user is existed
        try {
            var oUser = userRepository.findByUsername(requestDTO.getUsername());
            if (oUser.isPresent()) {
                if (oUser.get().isVerified()) {
                    return "Tài khoản này đã có hệ thống, vui lòng đăng ký bằng 1 tài khoản khác";
                } else {
                    User user = oUser.get();
                    user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
                    userRepository.save(user);
                    Optional<UserDetails> oDetails = userDetailsRepository.findById(user.getUserId());
                    UserDetails userDetails = oDetails.orElseGet(() -> UserDetails.builder().user(user).build());

                    userDetails.setDob(requestDTO.getDateOfBirth());
                    userDetails.setFullname(requestDTO.getFullName());
                    userDetails.setPhoneNum(requestDTO.getPhoneNum());
                    userDetailsRepository.save(userDetails);
                    return "Đăng ký tài khoản thành công. Vui lòng xác minh tài khoản";
                }
            }
            User userHasSameEmail = userRepository.findByEmail(requestDTO.getEmail());
            if (userHasSameEmail != null) {
                return "Email này đã được sử dụng. Vui lòng sử dụng email khác";
            }

            var user = userMapper.toEntity(requestDTO);
            user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
            user.setRole(UserRole.CUSTOMER);
            user.setVerified(false);
            user.setEmail(requestDTO.getEmail());
            user.setCreated_date(LocalDate.now());
            userRepository.save(user);
            UserDetails userDetails = UserDetails.builder()
                    .dob(requestDTO.getDateOfBirth())
                    .fullname(requestDTO.getFullName())
                    .phoneNum(requestDTO.getPhoneNum())

                    .user(user)
                    .build();
            userDetailsRepository.save(userDetails);
            return "Đăng ký tài khoản thành công. Vui lòng xác minh tài khoản";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String verify(LoginUserDTO requestDTO) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDTO.getUsername(),
                        requestDTO.getPassword()));
        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(requestDTO.getUsername());
        } else {
            throw new ApplicationException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    public String verifyAccountAdmin(LoginUserDTO requestDTO) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(requestDTO.getUsername(),
                        requestDTO.getPassword()));
        if (authentication.isAuthenticated()) {
            Optional<User> user = userRepository.findByUsername(requestDTO.getUsername());
            if (user.isPresent() && (user.get().getRole().equals(UserRole.ADMIN) || user.get().getRole().equals(UserRole.MANAGER))) {
                System.out.println("User role: " + user.get().getRole());
                return jwtService.generateToken(requestDTO.getUsername());

            } else {
                throw new ApplicationException(ErrorCode.UNAUTHORIZED);
            }
        } else {
            throw new ApplicationException(ErrorCode.USER_NOT_EXISTED);
        }
    }

    public User getUserByUserName(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApplicationException(ErrorCode.UNAUTHENTICATED));
        return user;
    }

}
