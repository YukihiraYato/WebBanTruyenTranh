package nlu.com.app.service.impl;

import lombok.RequiredArgsConstructor;
import nlu.com.app.constant.EUserStatus;
import nlu.com.app.constant.UserRole;
import nlu.com.app.dto.request.CreateUserForAdminRequestDTO;
import nlu.com.app.dto.request.FilterUserDetailsRequestDTO;
import nlu.com.app.dto.request.ResetPasswordRequestDTO;
import nlu.com.app.dto.request.UpdateUserForAdminRequestDTO;
import nlu.com.app.dto.response.UserDetailsResponseDTO;
import nlu.com.app.entity.Address;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserAddress;
import nlu.com.app.entity.UserDetails;
import nlu.com.app.exception.ApplicationException;
import nlu.com.app.exception.ErrorCode;
import nlu.com.app.repository.UserAddressRepository;
import nlu.com.app.repository.UserDetailsRepository;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.IUserDetailsService;
import nlu.com.app.specification.UserSpecification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Transactional
@Service
@RequiredArgsConstructor
public class UserDetailsService implements IUserDetailsService {
    private final UserDetailsRepository userDetailsRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    @Override
    public UserDetails getUserDetailsByUserId(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

            return userDetailsRepository.findById(user.getUserId())
                    .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public UserDetailsResponseDTO getUserDetails(Long userId) {
        // Lấy thông tin user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        // Lấy thông tin user details
        UserDetails userDetails = userDetailsRepository.findById(userId)
                .orElse(new UserDetails()); // Trả về đối tượng rỗng nếu không có

        // Lấy địa chỉ mặc định
        String defaultAddress = userAddressRepository.findByUserAndIsDefault(user, true)
                .map(UserAddress::getAddress)
                .map(Address::toString) // Giả định Address có phương thức toString() phù hợp
                .orElse("Chưa thiết lập");

        // Định dạng ngày tạo
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String formattedDate = user.getCreated_date().format(formatter);

        // Ánh xạ sang DTO
        return UserDetailsResponseDTO.builder()
                .userId(user.getUserId())
                .fullName(StringUtils.hasText(userDetails.getFullname()) ? userDetails.getFullname() : "Chưa thiết lập")
                .gender(StringUtils.hasText(userDetails.getGender()) ? userDetails.getGender() : "Chưa thiết lập")
                .phoneNum(StringUtils.hasText(userDetails.getPhoneNum()) ? userDetails.getPhoneNum() : "Chưa thiết lập")
                .email(StringUtils.hasText(user.getEmail()) ? user.getEmail() : "Chưa thiết lập")
                .username(user.getUsername())
                .dateOfBirth(userDetails.getDob())
                .status(user.getStatus().name())
                .build();
    }

    @Override
    public Page<UserDetailsResponseDTO> filterUsers(FilterUserDetailsRequestDTO request, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<User> userPage = userRepository.findAll(UserSpecification.filterUsers(request), pageable);

        return userPage.map(this::convertToDTO);
    }

    @Override
    public UserDetailsResponseDTO createUser(CreateUserForAdminRequestDTO request) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại!");
        }
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // Mã hóa mật khẩu
                .created_date(LocalDate.now())
                .verified(true) // Admin tạo thì mặc định đã verify
                .status(EUserStatus.ACTIVE)
                .role(request.getRole() != null ? UserRole.valueOf(request.getRole().toUpperCase()) : UserRole.CUSTOMER)
                .build();

        User savedUser = userRepository.save(newUser);

        UserDetails details = UserDetails.builder()
                .user(savedUser)
                .fullname(request.getFullName())
                .phoneNum(request.getPhoneNum())
                .gender(request.getGender())
                .dob(request.getDob())
                .build();

        userDetailsRepository.save(details);

        savedUser.setUserDetails(details);

        return convertToDTO(savedUser);
    }

    @Override
    public UserDetailsResponseDTO updateUser(Long userId, UpdateUserForAdminRequestDTO request) {
        // 1. Tìm User theo ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        // 2. Validate Email (Nếu có thay đổi Email)
        // Logic: Nếu email gửi lên KHÁC email hiện tại VÀ email đó đã tồn tại trong DB -> Lỗi
        if (request.getEmail() != null
                && !request.getEmail().equals(user.getEmail())
                && userRepository.findByEmail(request.getEmail()).getEmail() != null) {
            throw new RuntimeException("Email này đã được sử dụng bởi người khác!");
        }

        // 3. Cập nhật thông tin bảng User (Account)
        if (request.getEmail() != null) user.setEmail(request.getEmail());

        if (request.getStatus() != null) {
            try {
                user.setStatus(EUserStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Handle lỗi nếu gửi status tào lao
            }
        }

        if (request.getRole() != null) {
            try {
                user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
            }
        }

        if (request.getVerified() != null) user.setVerified(request.getVerified());

        // 4. Cập nhật thông tin bảng UserDetails
        UserDetails details = user.getUserDetails();

        // Trường hợp data cũ bị lỗi (User có nhưng chưa có dòng bên Details) -> Tạo mới
        if (details == null) {
            details = UserDetails.builder().user(user).build();
            user.setUserDetails(details); // Gán ngược lại để Cascade update
        }

        // Map dữ liệu từ Request sang Entity Details
        if (request.getFullName() != null) details.setFullname(request.getFullName());
        if (request.getPhoneNum() != null) details.setPhoneNum(request.getPhoneNum());
        if (request.getGender() != null) details.setGender(request.getGender());
        if (request.getDob() != null) details.setDob(request.getDob());

        // 5. Lưu xuống DB
        // Chỉ cần save User, vì CascadeType.ALL sẽ tự động update UserDetails
        User updatedUser = userRepository.save(user);

        // 6. Return DTO
        return convertToDTO(updatedUser);
    }

    @Override
    public void resetPassword(Long userId, ResetPasswordRequestDTO request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);
    }


    private UserDetailsResponseDTO convertToDTO(User user) {
        UserDetails details = user.getUserDetails();

        return UserDetailsResponseDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .verified(user.isVerified())
                .fullName(details != null && details.getFullname() != null ? details.getFullname() : "Chưa thiết lập")
                .gender(details != null && details.getGender() != null ? details.getGender() : "Chưa thiết lập")
                .phoneNum(details != null && details.getPhoneNum() != null ? details.getPhoneNum() : "Chưa thiết lập")
                .dateOfBirth(details != null ? details.getDob() : null)
                .build();
    }

    @Override
    public boolean updateUserDetails(UserDetails userDetails, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApplicationException(ErrorCode.USER_NOT_EXISTED));

        UserDetails userDetailSaved = userDetailsRepository.save(userDetails);
        return userDetailSaved != null;
    }

    @Override
    public boolean addUserDetails(UserDetails userDetails, Long userId) {
        try {
            UserDetails userDetailSaved = userDetailsRepository.save(userDetails);
            return userDetailSaved != null;
        } catch (DataIntegrityViolationException ex) {
            if (ex.getMessage().contains("Duplicate entry")) {
                return updateUserDetails(userDetails, userId);
            } else {
                throw ex;
            }
        }
    }
}
