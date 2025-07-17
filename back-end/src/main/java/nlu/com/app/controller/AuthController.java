package nlu.com.app.controller;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.LoginUserDTO;
import nlu.com.app.dto.request.RegisterUserDTO;
import nlu.com.app.dto.request.VerifyOTPRequestDTO;
import nlu.com.app.entity.User;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.EmailService;
import nlu.com.app.service.OtpRedisService;
import nlu.com.app.service.impl.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;

@RequestMapping("/api/v1/auth") // => /api/v1/auth/register
@RestController
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpRedisService otpService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public AppResponse<String> register(@RequestBody RegisterUserDTO requestDTO) {
       String result = userService.registerUser(requestDTO);
       if(result.equals("Tài khoản này đã có hệ thống, vui lòng đăng ký bằng 1 tài khoản khác")) {
           return AppResponse.<String>builder()
                   .result(result)
                   .build();
       }
       if(result.equals("Email này đã được sử dụng. Vui lòng sử dụng email khác")){
           return AppResponse.<String>builder()
                   .result(result)
                   .build();
       }
       if(result.equals("Đăng ký tài khoản thành công. Vui lòng xác minh tài khoản")) {
           return AppResponse.<String>builder()
                   .result(result)
                   .build();
       }
        return AppResponse.<String>builder()
                .result("Đăng ký tài khoản bị lỗi. Vui lòng thử lại sau")
                .build();

    }
    @PostMapping("register/send-otp")
    public AppResponse<String> sendOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String otp = generateOtp();
            emailService.sendOtpEmail(email, "OTP đăng ký", otp);
            otpService.saveOtp(email, otp);

            return AppResponse.<String>builder().result("Đã gửi OTP tới email.").build();
        } catch (Exception e) {
            e.printStackTrace();
            return AppResponse.<String>builder().result("Lỗi khi gửi OTP.").build();
        }
    }

    @PostMapping("/register/verify-otp")
    public  AppResponse<String> verifyOtp(@RequestBody VerifyOTPRequestDTO request) {
        try {
            boolean valid = otpService.isValid(request.getEmail(), request.getOtp());
            if (!valid) {
                return AppResponse.<String>builder().result("OTP sai hoặc hết hạn.").build();
            }
            otpService.clearOtp(request.getEmail());
            User user = userRepository.findByEmail(request.getEmail());
            user.setVerified(true);
            userRepository.save(user);
            return AppResponse.<String>builder().result("Xác thực OTP thành công!").build();
        }catch (Exception e) {
            e.printStackTrace();
            return AppResponse.<String>builder().result("Email không tồn tại. Vui lòng kiểm tra lại email.").build();
        }
    }


    @PostMapping("/login")
    public AppResponse<String> login(@RequestBody LoginUserDTO requestDTO) {
        var token = userService.verify(requestDTO);
        return AppResponse.<String>builder()
                .result(token)
                .build();
    }
    private String generateOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

}
