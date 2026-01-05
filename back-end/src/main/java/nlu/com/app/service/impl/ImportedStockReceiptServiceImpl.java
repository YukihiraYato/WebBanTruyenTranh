package nlu.com.app.service.impl;

import lombok.RequiredArgsConstructor;
import nlu.com.app.constant.EProductType;
import nlu.com.app.constant.EStockReceipt;
import nlu.com.app.dto.request.ImportItemRequestDTO;
import nlu.com.app.dto.request.ImportRequestDTO;
import nlu.com.app.dto.response.ImportReceiptResponse;
import nlu.com.app.entity.*;
import nlu.com.app.repository.*;
import nlu.com.app.service.ImportedStockReceiptService;
import nlu.com.app.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Transactional
@RequiredArgsConstructor
@Service
public class ImportedStockReceiptServiceImpl implements ImportedStockReceiptService {
    private final ImportedStockReceiptRepository importedStockReceiptRepository;
    private final BookRepository bookRepository;
    private final RedeemRepository redeemRepository;
    private final UserRepository userRepository;
    private final UserDetailsRepository userDetailsRepository;

    @Override
    public ImportedStockReceipt createImportReceipt(ImportRequestDTO request) {
        String user = SecurityUtils.getCurrentUsername();
        User userEntity = userRepository.findByUsername(user).orElseThrow(() -> new RuntimeException("User not found"));
        String fullNameUser = userDetailsRepository.findByUser_UserId(userEntity.getUserId()).map(UserDetails::getFullname).orElseThrow(() -> new RuntimeException("User not found"));
        ImportedStockReceipt receipt = ImportedStockReceipt.builder()
                .receiptCode("PN-" + System.currentTimeMillis())
                .supplierName(request.getSupplierName())
                .importerName(fullNameUser)
                .note(request.getNote())
                .createdAt(LocalDateTime.now())
                .status(EStockReceipt.PENDING)
                .details(new ArrayList<>())
                .build();

        double totalAmount = 0;

        for (ImportItemRequestDTO item : request.getItems()) {
            ImportedStockReceiptDetails detail = ImportedStockReceiptDetails.builder()
                    .receipt(receipt)
                    .quantity(item.getQuantity())
                    .importPrice(item.getImportPrice())
                    .productType(item.getProductType())
                    .build();

            // Xử lý mapping dựa trên loại sản phẩm
            if (item.getProductType() == EProductType.BOOK) {
                Book book = bookRepository.findById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("Book not found ID: " + item.getProductId()));
                detail.setBook(book);

            } else if (item.getProductType() == EProductType.REDEEM_REWARD) {
                RedeemReward reward = redeemRepository.findById(item.getProductId())
                        .orElseThrow(() -> new RuntimeException("Reward not found ID: " + item.getProductId()));
                detail.setReward(reward);

            }

            receipt.getDetails().add(detail);
            totalAmount += (item.getQuantity() * item.getImportPrice());
        }

        receipt.setTotalAmount(totalAmount);
        return importedStockReceiptRepository.save(receipt);
    }

    @Override
    public ImportedStockReceipt approveReceipt(Long receiptId) {
        ImportedStockReceipt receipt = importedStockReceiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập: " + receiptId));

        if (receipt.getStatus() != EStockReceipt.PENDING) {
            throw new RuntimeException("Phiếu này không ở trạng thái chờ duyệt (Có thể đã duyệt hoặc đã hủy)");
        }

        // Bắt đầu cộng kho
        for (ImportedStockReceiptDetails detail : receipt.getDetails()) {
            if (detail.getProductType() == EProductType.BOOK && detail.getBook() != null) {
                Book book = detail.getBook();
                book.setQtyInStock(book.getQtyInStock() + detail.getQuantity());
                book.setUpdatedAt(LocalDateTime.now());
                bookRepository.save(book);
            } else if (detail.getProductType() == EProductType.REDEEM_REWARD && detail.getReward() != null) {
                RedeemReward reward = detail.getReward();

                reward.setQty_in_stock(reward.getQty_in_stock() + detail.getQuantity());
                reward.setUpdatedDate(LocalDateTime.now());
                redeemRepository.save(reward);
            }
        }

        // Cập nhật trạng thái phiếu
        receipt.setStatus(EStockReceipt.COMPLETED);
        return importedStockReceiptRepository.save(receipt);
    }

    @Override
    public void cancelReceipt(Long receiptId) {
        ImportedStockReceipt receipt = importedStockReceiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        if (receipt.getStatus() == EStockReceipt.COMPLETED) {
            throw new RuntimeException("Không thể hủy phiếu đã nhập kho thành công!");
        }

        receipt.setStatus(EStockReceipt.CANCELLED);
        importedStockReceiptRepository.save(receipt);
    }

    @Override
    public Page<ImportReceiptResponse> getReceipts(EStockReceipt status, String keyword, Pageable pageable) {
        Page<ImportedStockReceipt> pageResult = importedStockReceiptRepository.searchReceipts(status, keyword, pageable);

        return pageResult.map(this::mapToResponse);
    }

    public ImportReceiptResponse getReceiptDetail(Long id) {
        ImportedStockReceipt receipt = importedStockReceiptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));
        return mapToResponse(receipt);
    }


    private ImportReceiptResponse mapToResponse(ImportedStockReceipt entity) {
        List<ImportReceiptResponse.ImportDetailResponse> details = entity.getDetails().stream().map(d -> {
            String name = "Unknown Product";
            Long pId = null;

            if (d.getProductType() == EProductType.BOOK && d.getBook() != null) {
                name = d.getBook().getTitle();
                pId = d.getBook().getBookId();
            } else if (d.getProductType() == EProductType.REDEEM_REWARD && d.getReward() != null) {
                name = d.getReward().getTitle();
                pId = d.getReward().getRewardId();
            }

            return ImportReceiptResponse.ImportDetailResponse.builder()
                    .id(d.getId())
                    .productId(pId)
                    .productName(name)
                    .productType(d.getProductType())
                    .quantity(d.getQuantity())
                    .importPrice(d.getImportPrice())
                    .lineTotal(d.getQuantity() * d.getImportPrice())
                    .build();
        }).toList();

        return ImportReceiptResponse.builder()
                .id(entity.getId())
                .receiptCode(entity.getReceiptCode())
                .supplierName(entity.getSupplierName())
                .importerName(entity.getImporterName())
                .totalAmount(entity.getTotalAmount())
                .note(entity.getNote())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getCreatedAt())
                .details(details)
                .build();
    }

}
