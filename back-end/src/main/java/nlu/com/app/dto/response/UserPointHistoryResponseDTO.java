package nlu.com.app.dto.response;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
public class UserPointHistoryResponseDTO {
    private Long id;
    private Double pointsChange;
    private String description;
    private LocalDateTime createdAt;
    private Long userPointId;
}
