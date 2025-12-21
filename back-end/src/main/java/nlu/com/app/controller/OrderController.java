package nlu.com.app.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.CreateOrderRequest;
import nlu.com.app.dto.request.OrderFilterRequest;
import nlu.com.app.dto.request.UpdateOrderStatus;
import nlu.com.app.dto.response.*;
import nlu.com.app.service.IOrderService;
import nlu.com.app.service.IPaymentMethodService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author VuLuu
 */
@RequestMapping("/api/orders")
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    private final IOrderService orderService;
    private final IPaymentMethodService paymentMethodService;


    @PostMapping
    public AppResponse<OrderResponseDTO> createOrder(@RequestBody CreateOrderRequest request) {
        return AppResponse.<OrderResponseDTO>builder().result(
                orderService.createOrderFromCart(request.getItems(),
                        request.getPaymentMethodId(), request.getListDiscountIds())).build();
    }

    @GetMapping()
    public Page<OrderResponseDTO> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return orderService.getOrdersWithPagination(pageable);
    }

    @GetMapping("/init")
    public AppResponse<List<PaymentMethodDTO>> getAllPaymentMethods() {
        return AppResponse.<List<PaymentMethodDTO>>builder()
                .result(paymentMethodService.getAllPaymentMethods()).build();
    }

    @DeleteMapping("/{orderId}/cancel")
    public AppResponse<String> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return AppResponse.<String>builder().result("Order cancelled successfully").build();
    }

    @GetMapping("/get-by-status")
    public AppResponse<Page<OrderResponseDTO>> getOrdersByStatus(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size);
        return AppResponse.<Page<OrderResponseDTO>>builder()
                .result(orderService.getOrdersByStatus(pageable, status)).build();
    }

    @PutMapping("/{orderId}/status")
    public AppResponse<String> updateStatus(@PathVariable Long orderId, @RequestBody UpdateOrderStatus request) {
        return AppResponse.<String>builder().result(orderService.updateOrderStatus(orderId, request)).build();
    }

    @PutMapping("admin/{orderId}/status")
    public AppResponse<String> updateStatusFromAdmin(@PathVariable Long orderId, @RequestBody UpdateOrderStatus request) {
        return AppResponse.<String>builder().result(orderService.updateOrderStatusFromAdmin(orderId, request)).build();
    }

    @GetMapping("/{orderId}/timeline")
    public AppResponse<TimelineOrderResponseDTO> getTimelineOrders(@PathVariable Long orderId) {
        return AppResponse.<TimelineOrderResponseDTO>builder()
                .result(orderService.getTimelineOrder(orderId))
                .build();
    }

    @GetMapping("/admin/count_status_order")
    public AppResponse<List<StatusCountResponseDTO>> getStatusCount() {
        return AppResponse.<List<StatusCountResponseDTO>>builder()
                .result(orderService.getStatusCount())
                .build();
    }

    @PostMapping("/admin/filter_orders")
    public AppResponse<Page<OrderDetailsResponseDTO>> filterOrders(
            @RequestBody OrderFilterRequest request,
            @PageableDefault(size = 10, page = 0)
            Pageable pageable
    ) {
        Page<OrderDetailsResponseDTO> orders = orderService.filterOrdersForAdmin(pageable, request);
        return AppResponse.<Page<OrderDetailsResponseDTO>>builder().result(orders).build();
    }
}
