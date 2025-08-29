package nlu.com.app.dto.request;

import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    
    @NotBlank(message = "Target type is required")
    private String targetType;
    
    @PositiveOrZero(message = "Minimum order amount must be positive or zero")
    private double minOrderAmount;
    
    @PositiveOrZero(message = "Usage limit must be positive or zero")
    private int usageLimit;
    
    @PositiveOrZero(message = "Use count must be positive or zero")
    private int useCount;
    
    @NotNull(message = "Start date is required")
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate endDate;
    
    private Boolean isActive = true;
}
