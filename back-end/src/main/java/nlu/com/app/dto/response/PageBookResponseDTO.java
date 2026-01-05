package nlu.com.app.dto.response;

/**
 * @author VuLuu
 */

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageBookResponseDTO {
    Long bookId;
    String title;
    double price;
    double discountedPrice;
    double discountPercentage;
    double averageRating;
    String imageUrl;
    String typePurchase;
    double quantityInStock;
}
