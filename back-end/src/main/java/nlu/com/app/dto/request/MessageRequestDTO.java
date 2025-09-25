package nlu.com.app.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;

@Getter
@Setter
public class MessageRequestDTO {
    private String message;
    @JsonFormat(pattern = "HH:mm dd/MM/yyyy")
    private LocalDateTime timeSendMessage;

}
