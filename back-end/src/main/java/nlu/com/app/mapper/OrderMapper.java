package nlu.com.app.mapper;

import java.util.ArrayList;
import java.util.List;

import nlu.com.app.constant.EOrderStatus;
import nlu.com.app.constant.EPaymentMethod;
import nlu.com.app.dto.response.OrderDetailsResponseDTO;
import nlu.com.app.dto.response.OrderResponseDTO;
import nlu.com.app.entity.*;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true))
public interface OrderMapper {

  OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

  // ========== BASIC ORDER DTO ==========
  @Mapping(source = "paymentMethod.methodName", target = "paymentMethodName", qualifiedByName = "enumToString")
  @Mapping(source = "status", target = "status", qualifiedByName = "orderStatusToString")
  @Mapping(source = "orderItems", target = "items", qualifiedByName = "mapToOrderItemsDTO")
  @Mapping(target = "shippingAddress", source = "address")
  @Mapping(source ="order", target = "timeFor5StatusOrder", qualifiedByName = "mapTimeFor5StatusOrder")
  OrderResponseDTO toOrderResponseDTO(Order order);

  // ========== ORDER ITEM MAPPING ==========
  @Named("mapToOrderItemsDTO")
  default List<OrderResponseDTO.OrderItemDTO> mapOrderItemsDTO(List<OrderItem> orderItems) {
    List<OrderResponseDTO.OrderItemDTO> orderItemDTOS = new ArrayList<>();
    for (OrderItem orderItem : orderItems) {
       if(orderItem.getBook() != null) {
         OrderResponseDTO.OrderItemDTO dto = new OrderResponseDTO.OrderItemDTO();
         dto.setImg(orderItem.getBook().getImages().stream()
                 .filter(img -> img.isThumbnail() && img.getImageUrl() != null && !img.getImageUrl().isEmpty())
                 .map(BookImage::getImageUrl)
                 .findFirst()
                 .orElse(null));
         dto.setBookTitle(orderItem.getBook().getTitle());
         dto.setPrice(orderItem.getPrice());
         dto.setQuantity(orderItem.getQuantity());
         dto.setDiscount(orderItem.getDiscountPercentage());
         orderItemDTOS.add(dto);
       }else {
         OrderResponseDTO.OrderItemDTO dto = new OrderResponseDTO.OrderItemDTO();
         dto.setImg(orderItem.getRedeemReward().getRedeemRewardImages().stream()
                 .filter(img -> img.getIsThumbnail() && img.getImages() != null && !img.getImages().isEmpty())
                 .map(RedeemRewardImages::getImages)
                 .findFirst()
                 .orElse(null));
         dto.setBookTitle(orderItem.getRedeemReward().getTitle());
         dto.setPrice(orderItem.getPrice());
         dto.setQuantity(orderItem.getQuantity());
         dto.setDiscount(orderItem.getDiscountPercentage());
         orderItemDTOS.add(dto);
       }
    }
    return orderItemDTOS;
  }
  @Named("mapToOrderItemsDTOForOrderDetails")
  default List<OrderDetailsResponseDTO.OrderItemDTO> mapOrderItemsDTOForDetails(List<OrderItem> orderItems) {
    List<OrderDetailsResponseDTO.OrderItemDTO> orderItemDTOS = new ArrayList<>();
    for (OrderItem orderItem : orderItems) {
    if(orderItem.getBook() != null) {
      OrderDetailsResponseDTO.OrderItemDTO dto = new OrderDetailsResponseDTO.OrderItemDTO();
      dto.setImg(orderItem.getBook().getImages().stream()
              .filter(img -> img.isThumbnail() && img.getImageUrl() != null && !img.getImageUrl().isEmpty())
              .map(BookImage::getImageUrl)
              .findFirst()
              .orElse(null));
      dto.setBookTitle(orderItem.getBook().getTitle());
      dto.setPrice(orderItem.getPrice());
      dto.setQuantity(orderItem.getQuantity());
      dto.setDiscount(orderItem.getDiscountPercentage());
      orderItemDTOS.add(dto);
    }else{
      OrderDetailsResponseDTO.OrderItemDTO dto = new OrderDetailsResponseDTO.OrderItemDTO();
      dto.setImg(orderItem.getRedeemReward().getRedeemRewardImages().stream()
              .filter(img -> img.getIsThumbnail() && img.getImages() != null && !img.getImages().isEmpty())
              .map(RedeemRewardImages::getImages)
              .findFirst()
              .orElse(null));
      dto.setBookTitle(orderItem.getRedeemReward().getTitle());
      dto.setPrice(orderItem.getPrice());
      dto.setQuantity(orderItem.getQuantity());
      dto.setDiscount(orderItem.getDiscountPercentage());
      orderItemDTOS.add(dto);
    }
    }
    return orderItemDTOS;
  }

  // ========== ORDER DETAILS DTO ==========
  @Mapping(source = "paymentMethod.methodName", target = "paymentMethodName", qualifiedByName = "enumToString")
  @Mapping(source = "status", target = "status", qualifiedByName = "orderStatusToString")
  @Mapping(source = "orderItems", target = "items", qualifiedByName = "mapToOrderItemsDTOForOrderDetails")
  @Mapping(target = "shippingAddress", source = "address")
  @Mapping(target = "customer", source = "user", qualifiedByName = "toCustomerDTO")
  @Mapping(target = "statusCode", source = "status", qualifiedByName = "orderStatusToString_2")
  @Mapping(target = "amountDecrease" , source = "amountDecrease")
  @Mapping(source ="order", target = "timeFor5StatusOrder", qualifiedByName = "mapTimeFor5StatusOrder")
  OrderDetailsResponseDTO toOrderDetailsResponseDTO(Order order);

  // ========== CUSTOMER ==========
  @Named("toCustomerDTO")
  @Mapping(target = "user_id", source = "userId")
  @Mapping(target = "username", source = "username")
  @Mapping(target = "email", expression = "java(user.getEmail() == null ? \"Người dùng này chưa set email \" : user.getEmail())")
  OrderDetailsResponseDTO.CustomerDTO toCustomerDTO(User user);

  // ========== IMAGE ==========
  @Named("mapImage")
  default String mapImage(Book book) {
    if (book.getImages() == null || book.getImages().isEmpty()) {
      return null;
    }
    return book.getImages().stream()
            .filter(img -> img.isThumbnail() && img.getImageUrl() != null && !img.getImageUrl().isEmpty())
            .map(BookImage::getImageUrl)
            .findFirst()
            .orElse(null);
  }

  // ========== ENUMS ==========
  @Named("enumToString")
  default String enumToString(EPaymentMethod method) {
    return method == null ? null : method.getDescription();
  }

  @Named("orderStatusToString")
  default String orderStatusToString(EOrderStatus status) {
    return status == null ? null : status.getDescription();
  }

  @Named("orderStatusToString_2")
  default String orderStatusToString_2(EOrderStatus status) {
    return status == null ? null : status.name();
  }

  // ========== TIME ==========
  @Named("mapTimeFor5StatusOrder")
  default OrderDetailsResponseDTO.TimeFor5StatusOrder mapTimeFor5StatusOrder(Order order) {
    var time = new OrderDetailsResponseDTO.TimeFor5StatusOrder();
    time.setPendingConfirmationDate(order.getPendingConfirmationDate());
    time.setConfirmedDate(order.getConfirmedDate());
    time.setShippingDate(order.getShippingDate());
    time.setDeliveredDate(order.getDeliveredDate());
    time.setCancelledDate(order.getCancelledDate());
    return time;
  }
}
