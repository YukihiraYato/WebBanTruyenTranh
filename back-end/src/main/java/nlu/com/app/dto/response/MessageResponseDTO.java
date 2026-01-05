package nlu.com.app.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDTO {
    private String sender;
    private String text;
    private LocalDateTime sentAt;
}
