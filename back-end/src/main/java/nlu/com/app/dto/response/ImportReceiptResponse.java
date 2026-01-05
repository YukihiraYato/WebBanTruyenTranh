package nlu.com.app.dto.response;

import lombok.Builder;
import lombok.Data;
import nlu.com.app.constant.EProductType;
import nlu.com.app.constant.EStockReceipt;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ImportReceiptResponse {
    private Long id;
    private String receiptCode;
    private String supplierName;
    private String importerName;
    private Double totalAmount;
    private String note;
    private EStockReceipt status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ImportDetailResponse> details;

    @Data
    @Builder
    public static class ImportDetailResponse {
        private Long id;
        private Long productId;
        private String productName;
        private EProductType productType;
        private int quantity;
        private Double importPrice;
        private Double lineTotal;
    }
}

