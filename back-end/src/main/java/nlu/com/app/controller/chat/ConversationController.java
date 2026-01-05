package nlu.com.app.controller.chat;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.response.AdminConversationInboxResponseDTO;
import nlu.com.app.dto.response.CanChatUserResponseDTO;
import nlu.com.app.dto.response.ConversationResponseDTO;
import nlu.com.app.entity.Conversation;
import nlu.com.app.entity.User;
import nlu.com.app.repository.ConversationRepository;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.ConversationService;
import nlu.com.app.service.impl.ChatFacade;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/load-conversation")
@RequiredArgsConstructor
public class ConversationController {
    final ConversationService conversationService;
    final ConversationRepository conversationRepository;
    final UserRepository userRepository;

    final ChatFacade chatFacade;

    @GetMapping("/user/{id}")
    public AppResponse<ConversationResponseDTO> getConversationByUserId(@PathVariable("id") Long id) {
        try {
            ConversationResponseDTO conversationResponseDTO = conversationService.getConversationByUserId(id);
            return AppResponse.<ConversationResponseDTO>builder().result(conversationResponseDTO).build();
        } catch (Exception e) {
            e.printStackTrace();
            return AppResponse.<ConversationResponseDTO>builder().result(null).code(9999).message("Lỗi không lấy được data cuộc trò chuyện của user với id: " + id).build();
        }

    }

    //        Lấy tất cả message trong 1 cuộc trò chuyện
    @GetMapping("/admin/conversation/{conversationId}")
    public AppResponse<ConversationResponseDTO> getAllMessageInAConversation(@PathVariable long conversationId) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId).orElse(null);
            if (conversation == null) {
                return AppResponse.<ConversationResponseDTO>builder().result(null).message("Không tìm thấy cuộc trò chuyện").build();
            } else {
                ConversationResponseDTO conversationResponseDTO = conversationService.getConversationByUserId(conversation.getClient().getUserId());
                conversationService.markConversationReadByAdmin(conversationId);
                return AppResponse.<ConversationResponseDTO>builder().result(conversationResponseDTO).build();
            }
        } catch (Exception e) {
            return AppResponse.<ConversationResponseDTO>builder().result(null).message("Lỗi không lấy được data cuộc trò chuyện").build();
        }
    }

    //    Lấy tất cả các tin mới nhất của toàn bộ user
    @GetMapping("/admin/inbox")
    public AppResponse<List<AdminConversationInboxResponseDTO>> getAdminInbox() {
        return AppResponse.<List<AdminConversationInboxResponseDTO>>builder()
                .result(conversationService.getAdminInbox())
                .build();
    }

    @PutMapping("admin/join_conversation/userId/{userId}")
    public AppResponse<CanChatUserResponseDTO> canJoinConversation(
            @PathVariable Long userId,
            Principal principal
    ) {
        User admin = userRepository
                .findByUsername(principal.getName())
                .orElseThrow();

        return AppResponse.<CanChatUserResponseDTO>builder()
                .result(conversationService.setConversationWithAdmin(admin, userId))
                .build();
    }

    @PutMapping("admin/leave_conversation/{conversationId}")
    public AppResponse<CanChatUserResponseDTO> leaveConversation(
            @PathVariable Long conversationId,
            Principal principal
    ) {
        User admin = userRepository
                .findByUsername(principal.getName())
                .orElseThrow();

        CanChatUserResponseDTO result =
                chatFacade.leaveConversation(conversationId, admin);

        return AppResponse.<CanChatUserResponseDTO>builder()
                .result(result)
                .build();
    }

}
