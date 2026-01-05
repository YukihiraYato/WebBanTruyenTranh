package nlu.com.app.service.impl;

import com.paypal.sdk.PaypalServerSdkClient;
import com.paypal.sdk.http.response.ApiResponse;
import com.paypal.sdk.models.Money;
import com.paypal.sdk.models.Refund;
import com.paypal.sdk.models.RefundCapturedPaymentInput;
import com.paypal.sdk.models.RefundRequest;
import lombok.RequiredArgsConstructor;
import nlu.com.app.constant.ERefundStatus;
import nlu.com.app.dto.request.HandleRequestRefundRequestDTO;
import nlu.com.app.dto.request.RefundItemsRequestFromClientDTO;
import nlu.com.app.dto.response.HandleRefundRequestResponseDTO;
import nlu.com.app.dto.response.OrderResponseDTO;
import nlu.com.app.dto.response.RefundItemsResponseDTO;
import nlu.com.app.entity.*;
import nlu.com.app.mapper.OrderMapper;
import nlu.com.app.repository.*;
import nlu.com.app.service.EmailService;
import nlu.com.app.service.RefundItemsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional

public class RefundItemsServiceImpl implements RefundItemsService {
    private static final double EXCHANGE_RATE = 26040.0;
    private final RefundItemsRepository refundItemsRepository;
    private final OrderRepository orderRepository;
    private final S3Client s3Client;
    private final EmailService emailService;
    private final OrderMapper orderMapper;
    private final BookRepository bookRepository;
    private final RedeemRepository redeemRepository;
    private final PaypalServerSdkClient paypalClient;
    private final UserPointRepository userPointRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final NotificationRepository notificationRepository;
    @Value("${app.aws.bucket.name}")
    private String bucketName;

    @Override
    public RefundItemsResponseDTO createRefundItems(RefundItemsRequestFromClientDTO requestDTO, MultipartFile[] images) {
        try {
            RefundItems refundItems = new RefundItems();
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile image : images) {
                String imageUrlFromS3 = uploadFile(image);
                imageUrls.add(imageUrlFromS3);
            }
            refundItems.setOrder(orderRepository.findById(Long.valueOf(requestDTO.getOrderId())).orElse(null));
            refundItems.setReason(requestDTO.getReason());
            refundItems.setStatus(ERefundStatus.PENDING_REFUND);
            List<RefundImage> refundImages = refundItems.getImages();
            for (String imageUrl : imageUrls) {
                RefundImage refundImage = new RefundImage();
                refundImage.setImageUrl(imageUrl);
                refundImage.setRefundRequest(refundItems);
                refundImages.add(refundImage);
            }
            refundItemsRepository.save(refundItems);
            RefundItemsResponseDTO refundItemsResponseDTO = new RefundItemsResponseDTO();
            refundItemsResponseDTO.setStatus(refundItems.getStatus().toString());
            refundItemsResponseDTO.setMessage(refundItems.getReason());

//            Thông báo cho Admin có đơn yêu cầu hoàn lại
            simpMessagingTemplate.convertAndSend("/notifyForAdminAboutOrder", "Đơn hàng #" + requestDTO.getOrderId() + " yêu cầu được hoàn");
            return refundItemsResponseDTO;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public RefundItemsResponseDTO getRefundItemsByOrderId(Long orderId) {
        try {
            RefundItems refundItems = refundItemsRepository.findByOrder_OrderId(orderId).orElse(null);
            Order order = orderRepository.findById(orderId).orElse(null);
            List<OrderItem> orderItems = order.getOrderItems();
            RefundItemsResponseDTO.OrderResponseDTO orderResponseDTO = new RefundItemsResponseDTO.OrderResponseDTO();
            orderResponseDTO.setOrderId(orderId);
            List<OrderResponseDTO.OrderItemDTO> orderItemResponseDTOS = orderMapper.mapOrderItemsDTO(orderItems);
            orderResponseDTO.setItems(orderItemResponseDTOS);

            RefundItemsResponseDTO refundItemsResponseDTO = new RefundItemsResponseDTO();
            refundItemsResponseDTO.setMessage(refundItems.getReason());
            refundItemsResponseDTO.setStatus(refundItems.getStatus().toString());
            refundItemsResponseDTO.setCreatedAt(refundItems.getCreatedAt());
            refundItemsResponseDTO.setImages(refundItems.getImages().stream().map(RefundImage::getImageUrl).toList());
            refundItemsResponseDTO.setOrderResponseDTO(orderResponseDTO);
            return refundItemsResponseDTO;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public HandleRefundRequestResponseDTO handleRefundItems(HandleRequestRefundRequestDTO refundItemsResponseDTO) {
        Order order = orderRepository.findByOrderId(Long.valueOf(refundItemsResponseDTO.getOrderId())).orElse(null);
        User user = order.getUser();
        RefundItems refundItem = refundItemsRepository.findByOrder_OrderId(order.getOrderId()).orElse(null);
        HandleRefundRequestResponseDTO handleRefundRequestResponseDTO = new HandleRefundRequestResponseDTO();
        String message = "";
        //        Tạo thông báo cho người dùng
        Notifications notifications = new Notifications();
        notifications.setUser(user);
        notifications.setRead(false);
        notifications.setTitle("Thông báo từ admin");
        switch (refundItemsResponseDTO.getStatus()) {
            case "APPROVED":
                boolean isRestock = handleStockFromRefundItems(refundItemsResponseDTO);

                switch (refundItemsResponseDTO.getTypeRefundMethod()) {

                    case "PAYPAL":
                        try {

                            // A. Kiểm tra Capture ID
                            String captureId = order.getPaypalCaptureId(); // Đảm bảo Entity Order đã có getter này
                            if (captureId == null || captureId.isEmpty()) {
                                throw new RuntimeException("Đơn hàng này không có Capture ID PayPal");
                            }

                            // B. Tính toán số tiền cần hoàn (VND -> USD)
                            // Giả sử DTO có gửi lên danh sách item cần hoàn, ta tính tổng tiền từ đó
                            double totalRefundVND = calculateTotalRefundAmount(refundItemsResponseDTO.getSelectedItems());

                            // Nếu admin nhập số tiền tay thì dùng dto.getRefundAmount() (tuỳ logic FE của bạn)

                            // Convert sang USD
                            double amountUSD = totalRefundVND / EXCHANGE_RATE;
                            String amountStr = String.format(Locale.US, "%.2f", amountUSD);

                            // C. Gọi API PayPal
                            Money refundAmount = new Money.Builder()
                                    .currencyCode("USD")
                                    .value(amountStr)
                                    .build();

                            RefundRequest refundRequest = new RefundRequest.Builder()
                                    .amount(refundAmount)
                                    .noteToPayer(refundItemsResponseDTO.getAdminNote())
                                    .build();
                            RefundCapturedPaymentInput input = new RefundCapturedPaymentInput.Builder(
                                    captureId, // capture_id
                                    null       // paypal_request_id (String):  null hoặc UUID.randomUUID().toString()
                            )
                                    .body(refundRequest) //  Truyền body ở đây
                                    .build();
                            ApiResponse<Refund> response = paypalClient.getPaymentsController().refundCapturedPayment(input);


                            // D. Gửi mail thông báo thành công
                            emailService.sendNotifyAboutRefundProduct(order.getUser().getEmail(),
                                    "Yêu cầu hoàn tiền PayPal thành công",
                                    "Số tiền " + amountStr + " USD đang được xử lý về ví của bạn.");


                        } catch (Exception e) {
                            e.printStackTrace();
                            // Có thể ném lỗi ra hoặc update status DB là REFUND_FAILED để Admin biết
                            throw new RuntimeException("Lỗi khi gọi PayPal Refund: " + e.getMessage());
                        }
                        break;
                    case "WB_POINT":
                        UserPoint userPoint = userPointRepository.findByUser_UserId(user.getUserId()).orElse(null);
                        double plusPoint = calculateTotalRefundAmount(refundItemsResponseDTO.getSelectedItems());
                        userPoint.setTotalPoint(userPoint.getTotalPoint() + plusPoint);
                        userPointRepository.save(userPoint);
                        break;
                    case "GET_NEW":
                        emailService.sendNotifyAboutRefundProduct(order.getUser().getEmail(),
                                "Yêu cầu hoàn mới sản phẩm thành công",
                                refundItemsResponseDTO.getAdminNote());
                        break;
                }

                if (refundItem != null) {
                    refundItem.setStatus(ERefundStatus.APPROVED);
                    refundItemsRepository.save(refundItem);
                }
                message = "Xử lý hoàn trả thành công.";
                notifications.setMessage("Chúng tôi đã xử lý yêu cầu hoàn trả của bạn thành công vơi đơn hàng có mã là #" + refundItemsResponseDTO.getOrderId() + ". Vui lòng kiểm tra lại email của bạn: " + user.getEmail());
                break;

            case "REJECTED":
                refundItem = refundItemsRepository.findByOrder_OrderId(order.getOrderId()).orElse(null);
                if (refundItem != null) {
                    refundItem.setStatus(ERefundStatus.REJECTED);
                    refundItemsRepository.save(refundItem);
                }
                user = order.getUser();
                String emailUser = user.getEmail();
                emailService.sendNotifyAboutRefundProduct(emailUser, "Thông báo về yêu cầu hoàn trả của bạn", refundItemsResponseDTO.getAdminNote());
                message = "Từ chối hoàn trả thành công";
                notifications.setMessage("Chúng tôi đã từ chối xử lý yêu cầu hoàn trả của bản với đơn hàng có mả so #" + refundItemsResponseDTO.getOrderId() + ". Vui lòng kiểm tra lại email của bạn để biết thông tin chi tiết: " + user.getEmail());
                break;
        }


        handleRefundRequestResponseDTO.setMessage(message);
        handleRefundRequestResponseDTO.setStatus(refundItem.getStatus().toString());
        notificationRepository.save(notifications);
        return handleRefundRequestResponseDTO;
    }

    private String uploadFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String keyName = "khoAnhBoSachCuaUser" + "/" + fileName; // tạo "folder" trong bucket

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
            // Trả về URL public của file, s3Client.serviceClientConfiguration().region().id() mới trả ra String region
            return String.format(
                    "https://%s.s3.%s.amazonaws.com/%s",
                    bucketName,
                    s3Client.serviceClientConfiguration().region().id(),
                    keyName
            );
        } catch (IOException e) {
            throw new RuntimeException("Upload file to S3 failed", e);
        }
    }

    private boolean handleStockFromRefundItems(HandleRequestRefundRequestDTO refundItemsResponseDTO) {
        if (refundItemsResponseDTO.getIsRestock()) {
            for (HandleRequestRefundRequestDTO.SelectedItemRefund item : refundItemsResponseDTO.getSelectedItems()) {
                if (item.getType().equals("BOOK")) {
                    Book book = bookRepository.findByBookId(item.getItemId()).orElse(null);
                    book.setQtyInStock(book.getQtyInStock() - item.getQuantity());
                    bookRepository.save(book);
                } else {
                    RedeemReward redeemReward = redeemRepository.findByRewardId(item.getItemId()).orElse(null);
                    redeemReward.setQty_in_stock(redeemReward.getQty_in_stock() - item.getQuantity());
                    redeemRepository.save(redeemReward);
                }

            }
            return true;
        } else {
            return false;
        }
    }

    private double calculateTotalRefundAmount(List<HandleRequestRefundRequestDTO.SelectedItemRefund> items) {
        double total = 0;
        for (HandleRequestRefundRequestDTO.SelectedItemRefund item : items) {
            total = total + item.getFinalPrice() * item.getQuantity();
        }
        return total;
    }

}
