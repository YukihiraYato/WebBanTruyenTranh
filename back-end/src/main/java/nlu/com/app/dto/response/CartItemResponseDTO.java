package nlu.com.app.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/**
 * @author VuLuu
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponseDTO {
    String typePurchase;
    Object item;

    @Data
    @Builder
    @Getter
    @Setter
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    @NoArgsConstructor
    public static class BookItemResponseDTO {
      Long productId;
      Integer quantity;
      String title;
      Double price;
      Double discountedPrice;
      Double discountPercentage;
      String imageUrl;
    }
    @Data
    @Builder
    @Getter
    @Setter
    @AllArgsConstructor(access = AccessLevel.PRIVATE)
    @NoArgsConstructor
  public static class RewardItemResponseDTO {
      Long productId;
      Integer quantity;
      Double price;
      String title;
      String imageUrl;
    }
}
