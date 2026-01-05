package nlu.com.app.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminConversationInboxResponseDTO {
    private Long conversationId;
    private Long userId;
    private String username;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private String status;
    private String currentAdmin;
}
