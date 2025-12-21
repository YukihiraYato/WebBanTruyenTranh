package nlu.com.app.dto.response;

import lombok.Data;
import nlu.com.app.dto.request.AddressDto;

import java.util.List;

/**
 * @author VuLuu
 */
@Data
public class OrderResponseDTO {

    public OrderDetailsResponseDTO.TimeFor5StatusOrder timeFor5StatusOrder;
    String status;
    private Long orderId;
    private Double totalAmount;
    private String paymentMethodName;
    private List<OrderItemDTO> items;
    private AddressDto shippingAddress;

    @Data
    public static class OrderItemDTO {
        private Long productId;
        private String img;
        private String bookTitle;
        private Double price;
        private Double finalPrice;
        private Integer quantity;
        private Double discount;
        private String typePurchase;
    }
}

