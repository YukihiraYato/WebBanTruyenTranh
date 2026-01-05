package nlu.com.app.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CanChatUserResponseDTO {
    private Long code;
    private String status;
    private String message;
}
