package nlu.com.app.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketTestController {

    @MessageMapping("/hello")
    @SendTo("/notifyOrderStatus/public")
    public String sendMessage(String message) {
        System.out.println("🔥 Đã nhận từ client: " + message);
        return "Server nhận được: " + message;
    }
}
