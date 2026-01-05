package nlu.com.app.dto.request;

import lombok.Data;
import nlu.com.app.constant.ReviewType;

import java.time.LocalDate;

@Data
public class ReviewFilterRequest {
    private String keyword;
    private ReviewType type;
    private Integer minRating;
    private LocalDate fromDate;
    private LocalDate toDate;
}
