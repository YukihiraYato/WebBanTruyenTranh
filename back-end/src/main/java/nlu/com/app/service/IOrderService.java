package nlu.com.app.service;

import nlu.com.app.dto.filter.OrderFilter;
import nlu.com.app.dto.request.CartItemRequestDTO;
import nlu.com.app.dto.request.OrderFilterRequest;
import nlu.com.app.dto.request.UpdateOrderStatus;
import nlu.com.app.dto.response.OrderDetailsResponseDTO;
import nlu.com.app.dto.response.OrderResponseDTO;
import nlu.com.app.dto.response.StatusCountResponseDTO;
import nlu.com.app.dto.response.TimelineOrderResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * @author VuLuu
 */
public interface IOrderService {

    OrderResponseDTO createOrderFromCart(List<CartItemRequestDTO> items, Long paymentMethodId, List<Long> listDiscountIds);

    OrderResponseDTO createOrderFromCartByPaypal(List<CartItemRequestDTO> items, Long paymentMethodId, List<Long> listDiscountIds, String captureId);

    Page<OrderResponseDTO> getOrdersWithPagination(Pageable pageable);

    Page<OrderDetailsResponseDTO> getOrdersWithPagination_ForAdmin(Pageable pageable);

    OrderDetailsResponseDTO getOrderById(Long id);

    void cancelOrder(Long orderId);

    String updateOrderStatus(Long orderId, UpdateOrderStatus request);

    String updateOrderStatusFromAdmin(Long orderId, UpdateOrderStatus request);

    TimelineOrderResponseDTO getTimelineOrder(Long orderId);

    Page<OrderDetailsResponseDTO> getFilteredOrders(Pageable pageable, OrderFilter filter);

    List<StatusCountResponseDTO> getStatusCount();

    Page<OrderDetailsResponseDTO> filterOrdersForAdmin(Pageable pageable, OrderFilterRequest orderFilterRequest);

    Page<OrderResponseDTO> getOrdersByStatus(Pageable pageable, String status);
}
