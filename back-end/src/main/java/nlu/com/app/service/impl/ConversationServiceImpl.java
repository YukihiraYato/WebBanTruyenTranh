package nlu.com.app.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import nlu.com.app.constant.ERole;
import nlu.com.app.constant.EStatusMessage;
import nlu.com.app.dto.response.ConversationResponseDTO;
import nlu.com.app.dto.response.ConversationResponseDTO.MessageUserResponse;
import nlu.com.app.entity.ChatHistory;
import nlu.com.app.entity.Conversation;
import nlu.com.app.entity.UserDetails;
import nlu.com.app.repository.ChatHistoryRepository;
import nlu.com.app.repository.ConversationRepository;
import nlu.com.app.repository.UserDetailsRepository;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.ConversationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Transactional
@RequiredArgsConstructor
@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationServiceImpl implements ConversationService {
    final ConversationRepository conversationRepository;
    final ChatHistoryRepository chatHistoryRepository;
    final UserRepository userRepository;
    final UserDetailsRepository userDetailsRepository;
    @Override
    public ConversationResponseDTO createNewConversation(Long userId) {
        Conversation conversation = conversationRepository.findByClient_UserId(userId).orElse(null);
        if (conversation == null) {
            conversation = new Conversation();
            conversation.setClient(userRepository.findById(userId).get());
            conversation.setCurrentAdmin(null);
            conversation.setStatus(EStatusMessage.WAITING_ADMIN);
            conversation.setTarget(ERole.BOT);
            conversationRepository.save(conversation);
        }

        Optional<List<ChatHistory>> listChatUser = chatHistoryRepository.findByUser_UserIdOrderByCreatedDateAsc(userId);
        ConversationResponseDTO conversationResponseDTO = new ConversationResponseDTO();
        if (listChatUser.isEmpty()) {

            conversationResponseDTO.setClientId(userId);

                conversationResponseDTO.setSystemName("BOTCHAT");

            conversationResponseDTO.setUserName(userRepository.findById(userId).get().getUsername());
        } else {

            conversationResponseDTO.setClientId(userId);

                conversationResponseDTO.setSystemName("BOTCHAT");

            conversationResponseDTO.setUserName(userRepository.findById(userId).get().getUsername());
            conversationResponseDTO.setMessage(listChatUser.get().stream().map(chatHistory -> {
                ConversationResponseDTO.MessageUserResponse messageUserResponse = new ConversationResponseDTO.MessageUserResponse();
                messageUserResponse.setId(chatHistory.getId());
                messageUserResponse.setUserId(chatHistory.getUser().getUserId());
                messageUserResponse.setMessage(chatHistory.getMessage());
                messageUserResponse.setCreatedDate(chatHistory.getCreatedDate());
//                messageUserResponse.setUserName(chatHistory.getUser().getUsername());
                return messageUserResponse;
            }).toList());
        }
        return conversationResponseDTO;
    }

    @Override
    public ConversationResponseDTO getConversationByUserId(Long userId) {

        // 1. Tìm conversation
        Conversation conversation = conversationRepository
                .findByClient_UserId(userId)
                .orElse(null);

        // 2. Nếu chưa có => tạo mới
        if (conversation == null) {
            return createNewConversation(userId);
        }

        // 3. Lấy admin nếu có
        UserDetails admin = null;
        if (conversation.getCurrentAdmin() != null) {
            Long adminId = conversation.getCurrentAdmin().getUserId();
            admin = userDetailsRepository.findById(adminId).orElse(null);
        }

        // 4. Tạo DTO trả về
        ConversationResponseDTO conversationResponseDTO = new ConversationResponseDTO();
        conversationResponseDTO.setClientId(userId);
        conversationResponseDTO.setId(conversation.getId());

        // conversationResponseDTO.setAdmin(admin);

        // 5. Lấy lịch sử chat
        Optional<List<ChatHistory>> listChatUser =
                chatHistoryRepository.findByUser_UserIdOrderByCreatedDateAsc(userId);

        if (listChatUser.isEmpty()) {
            return conversationResponseDTO;
        }

        conversationResponseDTO.setUserName(
                userRepository.findById(userId).orElseThrow().getUsername()
        );

        conversationResponseDTO.setMessage(
                listChatUser.get().stream().map(chatHistory -> {
                    ConversationResponseDTO.MessageUserResponse messageUserResponse =
                            new ConversationResponseDTO.MessageUserResponse();
                    messageUserResponse.setId(chatHistory.getId());
                    messageUserResponse.setUserId(chatHistory.getUser().getUserId());
                    messageUserResponse.setMessage(chatHistory.getMessage());
                    messageUserResponse.setCreatedDate(chatHistory.getCreatedDate());
                    messageUserResponse.setSender(chatHistory.getRole().toString());
                    return messageUserResponse;
                }).toList()
        );

        return conversationResponseDTO;
    }

}

