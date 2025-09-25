package nlu.com.app.service;

import nlu.com.app.dto.response.ConversationResponseDTO;

public interface  ConversationService {
    ConversationResponseDTO createNewConversation(Long userId);
    ConversationResponseDTO getConversationByUserId(Long userId);
}
