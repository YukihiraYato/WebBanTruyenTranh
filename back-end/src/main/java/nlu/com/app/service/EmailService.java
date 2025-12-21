package nlu.com.app.service;

public interface EmailService {
    void sendOtpEmail(String to, String subject, String otp);

    void sendNotifyAboutRefundProduct(String to, String subject, String message);
}
