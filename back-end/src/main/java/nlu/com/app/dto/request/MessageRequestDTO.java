package nlu.com.app.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MessageRequestDTO {
    private String message;
    @JsonFormat(pattern = "HH:mm dd/MM/yyyy")
    private LocalDateTime timeSendMessage;
    private Long conversationId;
}
