package nlu.com.app.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.time.LocalDateTime;

@Getter
@Setter
public class ConversationResponseDTO {
    private Long id;
    private  Long clientId;
    private String userName;
    private String systemName;
    private List<MessageUserResponse> message;

    @Getter
    @Setter
    public static class MessageUserResponse {
        private Long id;
        private Long userId;
        private String message;
        private LocalDateTime createdDate;
        private String sender;
    }
}