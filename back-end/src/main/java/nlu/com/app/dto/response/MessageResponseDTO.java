package nlu.com.app.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
public class MessageResponseDTO {
    private String sender;
    private String text;
    private LocalDateTime sentAt;
}
