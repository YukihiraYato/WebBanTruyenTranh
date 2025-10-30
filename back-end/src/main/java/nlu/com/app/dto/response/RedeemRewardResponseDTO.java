package nlu.com.app.dto.response;

import lombok.Getter;
import lombok.Setter;

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

    private String price;

    private Long qtyInStock;

    private String weight;


}
