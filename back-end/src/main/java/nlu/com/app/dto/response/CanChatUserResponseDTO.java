package nlu.com.app.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CanChatUserResponseDTO {
    private Long code;
    private String status;
    private String message;
}
