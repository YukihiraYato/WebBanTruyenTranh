package nlu.com.app.controller.chat;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.request.MessageRequestDTO;
import nlu.com.app.entity.User;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.impl.ChatFacade;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Transactional

public class WebSocketController {
    final UserRepository userRepository;
    final ChatFacade chatFacade;
    @MessageMapping("/hello")
    @SendTo("/notifyOrderStatus/public")
    public String sendMessage(String message) {
        System.out.println("🔥 Đã nhận từ client: " + message);
        return "Server nhận được: " + message;
    }
    @MessageMapping("/sendMessage/user")
    public void sendMessageFromUser(@Payload MessageRequestDTO messageRequestDTO, Principal principal) {
         String username = principal.getName();
         User user = userRepository.findByUsername(username).orElse(null);
         if (user != null) {
             chatFacade.handleUserMessage(user, messageRequestDTO);
         }
//         Không tồn tại user thì xử lý sau


    }
    @MessageMapping("sendMessage/admin")
    public void sendMessageFromAdmin(@Payload MessageRequestDTO messageRequestDTO, Principal principal, Long userId) {
        String username = principal.getName();
        User admin = userRepository.findByUsername(username).orElse(null);
        if (admin != null) {
            chatFacade.handleAdminMessage(admin, messageRequestDTO, userId);
        }
        //         Không tồn tại user thì xử lý sau
    }


}
