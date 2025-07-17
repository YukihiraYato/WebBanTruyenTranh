package nlu.com.app.dto.request;

import lombok.Getter;

@Getter
public class VerifyOTPRequestDTO {
    private String email;
    private String otp;
}
