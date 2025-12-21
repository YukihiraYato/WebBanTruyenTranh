package nlu.com.app.controller;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.HandleRequestRefundRequestDTO;
import nlu.com.app.dto.request.RefundItemsRequestFromClientDTO;
import nlu.com.app.dto.response.HandleRefundRequestResponseDTO;
import nlu.com.app.dto.response.RefundItemsResponseDTO;
import nlu.com.app.service.RefundItemsService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/book/refund-items")
public class RefundItemsController {
    private final RefundItemsService refundItemsService;

    @PostMapping(value = "/request-create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AppResponse<RefundItemsResponseDTO> createRequestRefundItems(@ModelAttribute RefundItemsRequestFromClientDTO requestDTO, @RequestPart(value = "image", required = false) MultipartFile[] image) {
        RefundItemsResponseDTO refundItemsResponseDTO = refundItemsService.createRefundItems(requestDTO, image);
        if (refundItemsResponseDTO != null) {
            return AppResponse.<RefundItemsResponseDTO>builder().message("Success").result(refundItemsResponseDTO).build();
        } else {
            return AppResponse.<RefundItemsResponseDTO>builder().message("Chúng tôi xin lỗi hiện tại không thể xử lý yêu cầu của quý khách. Mong quý khách thử lại lần sau").code(9999).build();
        }
    }

    @GetMapping("get-by-order-id/{orderId}")
    public AppResponse<RefundItemsResponseDTO> getRefundItemByOrderId(@PathVariable Long orderId) {
        RefundItemsResponseDTO refundItemsResponseDTO = refundItemsService.getRefundItemsByOrderId(orderId);
        return AppResponse.<RefundItemsResponseDTO>builder().result(refundItemsResponseDTO).build();
    }

    @PostMapping("handle-request-refund-items")
    public AppResponse<HandleRefundRequestResponseDTO> handleRequestRefundItems(@RequestBody HandleRequestRefundRequestDTO refundItemsResponseDTO) {
        try {
            HandleRefundRequestResponseDTO handleRefundRequestResponseDTO = refundItemsService.handleRefundItems(refundItemsResponseDTO);
            return AppResponse.<HandleRefundRequestResponseDTO>builder().result(handleRefundRequestResponseDTO).build();
        } catch (Exception e) {
            e.printStackTrace();
            return AppResponse.<HandleRefundRequestResponseDTO>builder().message("Hệ thống hiện tại không xử lý được yêu cầu của bạn . Mong bạn thử lại lần sau").code(9999).build();
        }
    }
}
