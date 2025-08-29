package nlu.com.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
@Data
public class UpdateDiscountRequestDTO {
    private Long id;
    private String code;


    private String title;

    private String description;


    private String discountType;


    private double value;


    private String targetType;


    private double minOrderAmount;


    private int usageLimit;


    private int useCount;


    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate startDate;


    @DateTimeFormat(pattern = "dd-MM-yyyy")
    private LocalDate endDate;

    private Boolean isActive = true;
}
