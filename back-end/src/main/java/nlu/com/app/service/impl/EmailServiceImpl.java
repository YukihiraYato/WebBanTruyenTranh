package nlu.com.app.service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import nlu.com.app.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
public class EmailServiceImpl implements EmailService {
    @Autowired
    private JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String to, String subject, String otp) {
        System.out.println("From email = " + fromEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "Bookstore App");
            helper.setTo(to);
            helper.setSubject(subject);

            // HTML đơn giản
            String htmlContent = "<div style='font-family:sans-serif;'>"
                    + "<h3>" + subject + "</h3>"
                    + "<p>Mã OTP của bạn là: <strong style='font-size: 20px;'>" + otp + "</strong></p>"
                    + "<p>Mã có hiệu lực trong vòng 5 phút.</p>"
                    + "</div>";

            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void sendNotifyAboutRefundProduct(String to, String subject, String message) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromEmail, "Bookstore App");
            helper.setTo(to);
            helper.setSubject(subject);

            // HTML đơn giản
            String htmlContent =
                    "<div style='font-family: Arial, sans-serif; line-height: 1.6; font-size: 14px;'>"
                            + "<h2 style='color:#333; margin-bottom:10px;'>" + subject + "</h2>"
                            + "<p style='white-space:pre-line; color:#555;'>" + message + "</p>"
                            + "<br/>"
                            + "<p style='color:#777;'>Trân trọng,<br>Bookstore App</p>"
                            + "</div>";

            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage());
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
}
