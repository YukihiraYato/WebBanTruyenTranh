package nlu.com.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
@Getter
@Setter
public class RedeemRewardResponseDTO {
    private Long rewardId;

    private String title;

    private String description;

    private String color;

    private String size;

    private String material;

    private String supplier;

    private String manufacturedIn;

    private String origin;

    private Double price;

    private Long qtyInStock;

    private String weight;
    private String typePurchase;

    private List<RedeemRewardImageResponseDTO> images;
    @Builder
    @Getter
    @Setter
    public static class RedeemRewardImageResponseDTO{
        private String imageUrl;
        private Boolean isThumbnail;
    }

}
