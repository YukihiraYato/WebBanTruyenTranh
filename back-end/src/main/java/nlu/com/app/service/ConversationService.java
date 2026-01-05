package nlu.com.app.service;

import nlu.com.app.dto.response.AdminConversationInboxResponseDTO;
import nlu.com.app.dto.response.CanChatUserResponseDTO;
import nlu.com.app.dto.response.ConversationResponseDTO;
import nlu.com.app.entity.User;

import java.util.List;

public interface ConversationService {
    ConversationResponseDTO createNewConversation(Long userId);

    ConversationResponseDTO getConversationByUserId(Long userId);

    List<ConversationResponseDTO> getAllConversationsForAdmin();

    CanChatUserResponseDTO setConversationWithAdmin(User admin, Long userId);

    List<AdminConversationInboxResponseDTO> getAdminInbox();

    void markConversationReadByAdmin(Long conversationId);
}
