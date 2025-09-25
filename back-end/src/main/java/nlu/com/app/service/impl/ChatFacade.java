package nlu.com.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import nlu.com.app.constant.ERole;
import nlu.com.app.constant.EStatusMessage;
import nlu.com.app.dto.request.MessageRequestDTO;
import nlu.com.app.dto.response.CanChatUserResponseDTO;
import nlu.com.app.dto.response.MessageResponseDTO;
import nlu.com.app.entity.ChatHistory;
import nlu.com.app.entity.Conversation;
import nlu.com.app.entity.User;
import nlu.com.app.repository.ChatHistoryRepository;
import nlu.com.app.repository.ConversationRepository;
import nlu.com.app.service.ConversationService;
import nlu.com.app.service.IChatService;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatFacade {
    final ChatHistoryRepository chatHistoryRepository;
    final SimpMessagingTemplate simpMessagingTemplate;
    final ConversationRepository conversationRepository;
    final ConversationService conversationService;
    final IChatService chatService;
     final StringRedisTemplate redisTemplate;
     static final String CHAT_KEY_PREFIX = "chat:history:";

    public void handleUserMessage(User user, MessageRequestDTO messageRequestDTO) {
        ChatHistory chatHistory = new ChatHistory();

        MessageResponseDTO messageOfBot = new MessageResponseDTO();
        if (user != null) {
            chatHistory.setUser(user);
            chatHistory.setRole(ERole.USER);
            chatHistory.setMessage(messageRequestDTO.getMessage());
            chatHistory.setCreatedDate(LocalDateTime.now());
            chatHistory.setIsRead(false);
            chatHistory.setSenderId(user.getUserId().toString());
            chatHistoryRepository.save(chatHistory);
            String chatBotReply;
            Conversation conversation = conversationRepository.findByClient_UserId(user.getUserId()).orElse(null);
            if (conversation == null) {
                conversationService.createNewConversation(user.getUserId());
                Conversation conversation1 = (conversationRepository.findByClient_UserId(user.getUserId())).get();
                redisTemplate.opsForList().leftPush(CHAT_KEY_PREFIX+ user.getUserId(), messageRequestDTO.getMessage());
                chatBotReply = chatService.reply(user.getUserId());
                chatHistory = new ChatHistory();
                chatHistory.setUser(user);
                chatHistory.setRole(ERole.BOT);
                chatHistory.setMessage(chatBotReply);
                chatHistory.setCreatedDate(LocalDateTime.now());
                chatHistory.setIsRead(false);
                chatHistory.setSenderId("BOTCHAT");
                chatHistory.setConversation_chat_history(conversation1);
                conversation1.getChatHistory().add(chatHistory);
                chatHistoryRepository.save(chatHistory);
                messageOfBot.setSender("BOT");
                messageOfBot.setText(chatBotReply);
                messageOfBot.setSentAt(LocalDateTime.now());

                simpMessagingTemplate.convertAndSend("/receive/message/conversation/" + conversation1.getId(), messageOfBot);


            }else {


                redisTemplate.opsForList().leftPush(CHAT_KEY_PREFIX+ user.getUserId(), messageRequestDTO.getMessage());
                chatBotReply = chatService.reply(user.getUserId());
                chatHistory = new ChatHistory();
                chatHistory.setUser(user);
                chatHistory.setRole(ERole.BOT);
                chatHistory.setMessage(chatBotReply);
                chatHistory.setCreatedDate(LocalDateTime.now());
                chatHistory.setIsRead(false);
                chatHistory.setSenderId("BOTCHAT");
                chatHistory.setConversation_chat_history(conversation);
                conversation.getChatHistory().add(chatHistory);
                chatHistoryRepository.save(chatHistory);

                messageOfBot.setSender("BOT");
                messageOfBot.setText(chatBotReply);
                messageOfBot.setSentAt(LocalDateTime.now());

                simpMessagingTemplate.convertAndSend("/receive/message/conversation/" + conversation.getId(), messageOfBot);

            }

        }else{
            throw new RuntimeException("User not found");
        }

    }
    public void handleAdminMessage(User admin, MessageRequestDTO dto, Long userId) {
        Conversation conversation = conversationRepository.findByClient_UserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        ChatHistory chatHistory = new ChatHistory();
        chatHistory.setUser(admin);
        chatHistory.setRole(ERole.ADMIN);
        chatHistory.setMessage(dto.getMessage());
        chatHistory.setCreatedDate(LocalDateTime.now()); // hoặc validate dto.getTimeSendMessage()
        chatHistory.setIsRead(false);
        chatHistory.setSenderId("ADMIN");
        chatHistory.setConversation_chat_history(conversation);

        chatHistoryRepository.save(chatHistory);
        MessageResponseDTO messageResponseDTO = new MessageResponseDTO();
        messageResponseDTO.setSender("ADMIN");
        messageResponseDTO.setText(dto.getMessage());
        messageResponseDTO.setSentAt(LocalDateTime.now());

        simpMessagingTemplate.convertAndSend("/receive/message/conversation/" + conversation.getId(),messageResponseDTO);
    }
    public CanChatUserResponseDTO setConversationWithAdmin(User admin, Long userId){
       try{
           CanChatUserResponseDTO canChatUserResponseDTO = new CanChatUserResponseDTO();
           Conversation conversation = conversationRepository.findByClient_UserId(userId).orElse(null);
           if(conversation.getCurrentAdmin() == null && conversation.getStatus().equals(EStatusMessage.WAITING_ADMIN)){
               conversation.setCurrentAdmin(admin);
               conversation.setStatus(EStatusMessage.HAS_ADMIN);
               conversationRepository.save(conversation);
               canChatUserResponseDTO.setCode(1000L);
               canChatUserResponseDTO.setStatus("Success");
               canChatUserResponseDTO.setMessage("Có thể chat với user với id: "+userId);
               return canChatUserResponseDTO;
           }else {
               User anotherAdmin = conversation.getCurrentAdmin();
               canChatUserResponseDTO.setCode(9999L);
               canChatUserResponseDTO.setStatus("Fail");
               canChatUserResponseDTO.setMessage("User với id: "+userId+" đang trong trò chuyện với admin "+ anotherAdmin.getUsername());
               return canChatUserResponseDTO;
           }

       } catch (Exception e) {
           throw new RuntimeException(e);
       }


    }
}
