package nlu.com.app.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
public class DiscountResponseDTO {
    private Long discountId;
    private String code;
    private String title;
    private String description;
    private String discountType;
    private double value;
    private TargetType targetType;
    private double minOrderAmount;
    private int usageLimit;
    private int useCount;
    private int usageLimitPerUser;
    private String startDate;
    private String endDate;
    private Boolean isActive;
    private List<Long> booksId;
    private String rankForVipCustomer;
    private Integer pointCost;

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
