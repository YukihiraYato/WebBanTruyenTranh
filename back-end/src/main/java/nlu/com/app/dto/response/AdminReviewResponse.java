package nlu.com.app.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AdminReviewResponse {
    private Long reviewId;
    private String userName;
    private String userEmail;
    private String targetName;
    private String targetType;
    private double rating;
    private String reviewText;
    private LocalDate reviewDate;
    private String targetImage;
}
