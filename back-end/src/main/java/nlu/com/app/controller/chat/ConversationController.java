package nlu.com.app.controller.chat;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.response.CanChatUserResponseDTO;
import nlu.com.app.dto.response.ConversationResponseDTO;
import nlu.com.app.entity.User;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.ConversationService;
import nlu.com.app.service.impl.ChatFacade;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/load-conversation")
@RequiredArgsConstructor
public class ConversationController {
    final ConversationService conversationService;
    final UserRepository userRepository;
    final ChatFacade chatFacade;

    @GetMapping("/user/{id}")
    public AppResponse<ConversationResponseDTO> getConversationByUserId(@PathVariable("id") Long id) {
        try {
            ConversationResponseDTO conversationResponseDTO = conversationService.getConversationByUserId(id);
            return AppResponse.<ConversationResponseDTO>builder().result(conversationResponseDTO).build();
        } catch (Exception e) {
            e.printStackTrace();
            return AppResponse.<ConversationResponseDTO>builder().result(null).code(9999).message("Lỗi không lấy được data cuộc trò chuyện của user với id: " + id + "").build();
        }

    }

    @GetMapping("/admin")
    public AppResponse<List<ConversationResponseDTO>> getAllConversation() {
        try {
            List<ConversationResponseDTO> listConversation = new ArrayList<>();
            List<Long> listUserId = new ArrayList<>();
            for (int i = 0; i < userRepository.findAll().size(); i++) {
                listUserId.add(userRepository.findAll().get(i).getUserId());
            }
            for (Long userId : listUserId) {
                listConversation.add(conversationService.getConversationByUserId(userId));
            }
            return AppResponse.<List<ConversationResponseDTO>>builder().result(listConversation).build();
        } catch (Exception e) {
            return AppResponse.<List<ConversationResponseDTO>>builder().result(null).message("Lỗi không lấy được data cuộc trò chuyện").build();
        }
    }

    @PutMapping("admin/join_conversation/userId/{userId}")
    public AppResponse<CanChatUserResponseDTO> canJoinConversation(@PathVariable("userId") Long userId) {
        {
            User admin = userRepository.findByUsername("admin").orElse(null);
            CanChatUserResponseDTO canChatUserResponseDTO = chatFacade.setConversationWithAdmin(admin, userId);
            return AppResponse.<CanChatUserResponseDTO>builder().result(canChatUserResponseDTO).build();
        }
    }
}
