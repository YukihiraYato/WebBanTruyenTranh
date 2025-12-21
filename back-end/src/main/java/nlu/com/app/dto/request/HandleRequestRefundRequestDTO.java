package nlu.com.app.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
public class HandleRequestRefundRequestDTO {
    private String orderId;
    private String adminNote;
    private String typeRefundMethod;
    private String status;

    private Boolean isRestock;
    private List<SelectedItemRefund> selectedItems;

    @Builder
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SelectedItemRefund {
        private Long itemId;
        private Integer quantity;
        private String type;
        private Double finalPrice;
    }
}
