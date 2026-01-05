package nlu.com.app.controller.admin;

import lombok.RequiredArgsConstructor;
import nlu.com.app.constant.EStockReceipt;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.ImportRequestDTO;
import nlu.com.app.dto.response.PageBookResponseDTO;
import nlu.com.app.entity.Book;
import nlu.com.app.repository.BookRepository;
import nlu.com.app.repository.RedeemRepository;
import nlu.com.app.service.ImportedStockReceiptService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/import-product")
public class AdminImportProductController {
    private final ImportedStockReceiptService importedStockReceiptService;
    private final BookRepository bookRepository;
    private final RedeemRepository redeemRepository;

    @GetMapping("/get-all")
    public AppResponse<?> getReceipts(
            @RequestParam(required = false) EStockReceipt status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return AppResponse.builder()
                .result(importedStockReceiptService.getReceipts(status, keyword, pageable))
                .build();
    }

    @GetMapping("/{id}")
    public AppResponse<?> getReceiptDetail(@PathVariable Long id) {
        return AppResponse.builder()
                .result(importedStockReceiptService.getReceiptDetail(id))
                .build();
    }

    @GetMapping("/search-product")
    public AppResponse<Page<PageBookResponseDTO>> searchProduct(@RequestParam String keyword, @RequestParam String typeProduct, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        if (typeProduct.equalsIgnoreCase("book")) {
            Page<Book> pageBookResponseDTOS = bookRepository.findBooksForImportStockByName(keyword, PageRequest.of(page, size));
            Page<PageBookResponseDTO> pageProduct = pageBookResponseDTOS.map(book -> {
                PageBookResponseDTO pageBookResponseDTO = new PageBookResponseDTO();
                pageBookResponseDTO.setBookId(book.getBookId());
                pageBookResponseDTO.setTitle(book.getTitle());
                pageBookResponseDTO.setPrice(book.getPrice());
                pageBookResponseDTO.setQuantityInStock(book.getQtyInStock());
                pageBookResponseDTO.setTypePurchase(book.getTypePurchase());
                pageBookResponseDTO.setImageUrl(book.getImages().stream().findFirst().get().getImageUrl());
                return pageBookResponseDTO;
            });
            return AppResponse.<Page<PageBookResponseDTO>>builder().result(pageProduct).build();
        } else {
            Page<PageBookResponseDTO> pageProduct = redeemRepository.findByTitleContainingIgnoreCase(keyword, PageRequest.of(page, size)).map(redeem -> {
                PageBookResponseDTO pageBookResponseDTO = new PageBookResponseDTO();
                pageBookResponseDTO.setBookId(redeem.getRewardId());
                pageBookResponseDTO.setTitle(redeem.getTitle());
                pageBookResponseDTO.setPrice(redeem.getPrice());
                pageBookResponseDTO.setQuantityInStock(redeem.getQty_in_stock());
                pageBookResponseDTO.setTypePurchase(redeem.getTypePurchase());
                pageBookResponseDTO.setImageUrl(redeem.getRedeemRewardImages().stream().findFirst().get().getImages());
                return pageBookResponseDTO;
            });
            return AppResponse.<Page<PageBookResponseDTO>>builder()
                    .result(pageProduct)
                    .build();
        }

    }


    @PostMapping("/create")
    public AppResponse<String> createReceipt(@RequestBody ImportRequestDTO request) {
        try {
            importedStockReceiptService.createImportReceipt(request);
            return AppResponse.<String>builder().result("Tạo phiếu nhập  hàng thành công!").build();
        } catch (Exception e) {
            e.printStackTrace();
            return AppResponse.<String>builder().result("Tạo phiếu nhập  hàng thái bị lỗi!").build();

        }

    }

    @PutMapping("/approve/{id}")
    public AppResponse<String> approveReceipt(@PathVariable Long id) {
        try {
            importedStockReceiptService.approveReceipt(id);
            return AppResponse.<String>builder().result("Duyệt phiếu nhập hàng thành công !").build();
        } catch (Exception e) {
            e.printStackTrace();
            return AppResponse.<String>builder().result("Duyệt phiếu nhập hàng bị lỗi !").build();
        }
    }


    @PutMapping("/cancel/{id}")
    public AppResponse<?> cancelReceipt(@PathVariable Long id) {
        try {
            importedStockReceiptService.cancelReceipt(id);
            return AppResponse.<String>builder().result("Đã hủy phiếu nhập hàng !").build();
        } catch (Exception e) {
            e.printStackTrace();
            return AppResponse.<String>builder().result("Hủy phiếu nhập hàng thái bị lỗi !").build();
        }
    }
}
