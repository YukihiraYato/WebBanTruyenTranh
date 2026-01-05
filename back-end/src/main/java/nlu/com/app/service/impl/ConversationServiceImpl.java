package nlu.com.app.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import nlu.com.app.constant.ERole;
import nlu.com.app.constant.EStatusMessage;
import nlu.com.app.dto.response.AdminConversationInboxResponseDTO;
import nlu.com.app.dto.response.CanChatUserResponseDTO;
import nlu.com.app.dto.response.ConversationResponseDTO;
import nlu.com.app.dto.response.MessageResponseDTO;
import nlu.com.app.entity.ChatHistory;
import nlu.com.app.entity.Conversation;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserDetails;
import nlu.com.app.repository.ChatHistoryRepository;
import nlu.com.app.repository.ConversationRepository;
import nlu.com.app.repository.UserDetailsRepository;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.ConversationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    final SimpMessagingTemplate simpMessagingTemplate;

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

        conversationResponseDTO.setUserName(
                userRepository.findById(userId).orElseThrow().getUsername()
        );

        if (listChatUser.isEmpty()) {
            return conversationResponseDTO;
        }


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

    public void markConversationReadByAdmin(Long conversationId) {
        chatHistoryRepository.markReadByConversationAndRole(
                conversationId,
                List.of(ERole.USER, ERole.BOT)
        );
    }

    @Override
    public List<ConversationResponseDTO> getAllConversationsForAdmin() {

        List<Conversation> conversations = conversationRepository.findAllByStatusIn(List.of(
                EStatusMessage.WAITING_ADMIN,
                EStatusMessage.HAS_ADMIN));
        return conversations.stream().map(conversation -> {
            Optional<List<ChatHistory>> listChatUser =
                    chatHistoryRepository.findByUser_UserIdOrderByCreatedDateAsc(conversation.getClient().getUserId());
            ConversationResponseDTO conversationResponseDTO = new ConversationResponseDTO();
            conversationResponseDTO.setId(conversation.getId());
            conversationResponseDTO.setClientId(conversation.getClient().getUserId());
            conversationResponseDTO.setUserName(conversation.getClient().getUsername());
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
        }).toList();
    }

    public CanChatUserResponseDTO setConversationWithAdmin(User admin, Long userId) {
        try {
            CanChatUserResponseDTO canChatUserResponseDTO = new CanChatUserResponseDTO();
            Conversation conversation = conversationRepository.findByClient_UserId(userId).orElse(null);
            if (conversation.getCurrentAdmin() == null && conversation.getStatus().equals(EStatusMessage.WAITING_ADMIN)) {
                conversation.setCurrentAdmin(admin);
                conversation.setStatus(EStatusMessage.HAS_ADMIN);
                conversationRepository.save(conversation);
                canChatUserResponseDTO.setCode(1000L);
                canChatUserResponseDTO.setStatus("Success");
                canChatUserResponseDTO.setMessage("Có thể chat với user với id: " + userId);
                simpMessagingTemplate.convertAndSend(
                        "/topic/admin/inbox",
                        "AMIN_JOIN_CONVERSATION"
                );
                
                String notiText = admin.getRole() + " " + admin.getUsername().toUpperCase() + " đã tham gia cuộc trò chuyện.";
                ChatHistory systemMsg = new ChatHistory();
                User user = conversation.getClient();
                systemMsg.setUser(user);
                systemMsg.setRole(ERole.SYSTEM);
                systemMsg.setMessage(notiText);
                systemMsg.setCreatedDate(LocalDateTime.now());
                systemMsg.setIsRead(true);
                systemMsg.setSenderId("SYSTEM");
                systemMsg.setConversation_chat_history(conversation);
                chatHistoryRepository.save(systemMsg);

                MessageResponseDTO responseDTO = MessageResponseDTO.builder()
                        .sender("SYSTEM")
                        .text(notiText)
                        .sentAt(LocalDateTime.now())
                        .build();

                simpMessagingTemplate.convertAndSend(
                        "/receive/message/conversation/" + conversation.getId(),
                        responseDTO
                );

                return canChatUserResponseDTO;
            } else {
                if (conversation.getCurrentAdmin().getUserId().equals(admin.getUserId())
                        && conversation.getStatus().equals(EStatusMessage.HAS_ADMIN)) {
                    canChatUserResponseDTO.setCode(1000L);
                    canChatUserResponseDTO.setStatus("Success");
                    canChatUserResponseDTO.setMessage("Có thể chat với user với id: " + userId);
                    simpMessagingTemplate.convertAndSend(
                            "/topic/admin/inbox",
                            "AMIN_JOIN_CONVERSATION"
                    );
                    return canChatUserResponseDTO;
                } else {
                    User anotherAdmin = conversation.getCurrentAdmin();
                    canChatUserResponseDTO.setCode(9999L);
                    canChatUserResponseDTO.setStatus("Fail");
                    canChatUserResponseDTO.setMessage("User với id: " + userId + " đang trong trò chuyện với admin " + anotherAdmin.getUsername());
                    return canChatUserResponseDTO;
                }
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }


    }

    @Override
    public List<AdminConversationInboxResponseDTO> getAdminInbox() {
        return conversationRepository.findInboxForAdmin();
    }

}

