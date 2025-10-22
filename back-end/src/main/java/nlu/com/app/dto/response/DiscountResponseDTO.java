package nlu.com.app.dto.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DiscountResponseDTO {
    private Long discountId;
    private String code;
    private String title;
    private String description;
    private String discountType;
    private double value;
    private String targetType;
    private double minOrderAmount;
    private int usageLimit;
    private int useCount;
    private String startDate;
    private String endDate;
    private Boolean isActive ;
}
