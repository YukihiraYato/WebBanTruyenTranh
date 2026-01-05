package nlu.com.app.service;

import nlu.com.app.constant.EStockReceipt;
import nlu.com.app.dto.request.ImportRequestDTO;
import nlu.com.app.dto.response.ImportReceiptResponse;
import nlu.com.app.entity.ImportedStockReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ImportedStockReceiptService {
    ImportedStockReceipt createImportReceipt(ImportRequestDTO request);

    ImportedStockReceipt approveReceipt(Long receiptId);

    void cancelReceipt(Long receiptId);

    Page<ImportReceiptResponse> getReceipts(EStockReceipt status, String keyword, Pageable pageable);

    ImportReceiptResponse getReceiptDetail(Long id);

}
