package nlu.com.app.dto.json;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
public class RedeemRewardJson {
    long reward_id;
    String title;
    String price;
    String description;
    String supplier;
    String origin;
    String manufactured_in;
    String color;
    String material;
    String size;
    String weight;
    int qty_in_stock;
    String [] images;
    String url;

}
