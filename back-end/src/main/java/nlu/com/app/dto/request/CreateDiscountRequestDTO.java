package nlu.com.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDiscountRequestDTO {
    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Discount type is required")
    private String discountType;

    @PositiveOrZero(message = "Value must be positive or zero")
    private double value;

    private TargetType targetType;

    @PositiveOrZero(message = "Minimum order amount must be positive or zero")
    private double minOrderAmount;


    private int usageLimit;
    private int useCount;
    private int usageLimitPerUser;

    @NotNull(message = "Start date is required")
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate endDate;

    private Boolean isActive = true;
    private String userRank;
    private Double pointCost;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TargetType {
        private String targetType;
        //        trường categoryIds chi có value chỉ khi targetType = "Book"
        private List<Long> categoryIds;
    }
}
