package nlu.com.app.service;

public interface EmailService {
    public void sendOtpEmail(String to, String subject, String otp);
}
