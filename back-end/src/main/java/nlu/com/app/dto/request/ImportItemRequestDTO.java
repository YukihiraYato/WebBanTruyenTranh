package nlu.com.app.dto.request;

import lombok.Data;
import nlu.com.app.constant.EProductType;


@Data
public class ImportItemRequestDTO {
    private Long productId;
    private EProductType productType;
    private int quantity;
    private Double importPrice;
}
