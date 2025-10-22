package nlu.com.app.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Data;
import nlu.com.app.dto.request.AddressDto;

/**
 * @author VuLuu
 */
@Data
public class OrderResponseDTO {

  private Long orderId;
  public OrderDetailsResponseDTO.TimeFor5StatusOrder timeFor5StatusOrder;
  private Double totalAmount;
  private String paymentMethodName;
  private List<OrderItemDTO> items;
  String status;
  private AddressDto shippingAddress;
  @Data
  public static class OrderItemDTO {
    private String img;
    private String bookTitle;
    private Double price;
    private Integer quantity;
    private Double discount;
  }
}

