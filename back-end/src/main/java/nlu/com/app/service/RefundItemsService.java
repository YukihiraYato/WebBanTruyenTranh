package nlu.com.app.service;

import nlu.com.app.dto.request.HandleRequestRefundRequestDTO;
import nlu.com.app.dto.request.RefundItemsRequestFromClientDTO;
import nlu.com.app.dto.response.HandleRefundRequestResponseDTO;
import nlu.com.app.dto.response.RefundItemsResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface RefundItemsService {
    RefundItemsResponseDTO createRefundItems(RefundItemsRequestFromClientDTO requestDTO, MultipartFile[] images);

    RefundItemsResponseDTO getRefundItemsByOrderId(Long orderId);

    HandleRefundRequestResponseDTO handleRefundItems(HandleRequestRefundRequestDTO refundItemsResponseDTO);
}
