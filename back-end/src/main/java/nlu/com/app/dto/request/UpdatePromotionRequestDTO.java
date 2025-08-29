package nlu.com.app.dto.request;

import lombok.Getter;

import java.util.List;
@Getter
public class UpdatePromotionRequestDTO {
    Long promotionId;
    String promotionName;
    Float discountPercentage;
    String startDate;
    String endDate;
   Long [] categoryIds;
}

