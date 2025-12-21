package nlu.com.app.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RefundItemsRequestFromClientDTO {
    private String orderId;
    private String reason;
}
