package nlu.com.app.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class RefundItemsResponseDTO {
    private String message;
    private String status;
    private List<String> images;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    private OrderResponseDTO orderResponseDTO;

    @Builder
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderResponseDTO {
        private Long orderId;
        private List<nlu.com.app.dto.response.OrderResponseDTO.OrderItemDTO> items;
    }
}