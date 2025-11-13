package nlu.com.app.dto.request;

import lombok.Data;

@Data
public class CartItemRequestDTO {
    private String typePurchase;
    private Object item;
}
