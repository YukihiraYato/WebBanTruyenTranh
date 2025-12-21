package nlu.com.app.controller.paypal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paypal.sdk.PaypalServerSdkClient;
import com.paypal.sdk.exceptions.ApiException;
import com.paypal.sdk.http.response.ApiResponse;
import com.paypal.sdk.models.*;
import nlu.com.app.constant.EDiscountTarget;
import nlu.com.app.constant.EDiscountType;
import nlu.com.app.dto.request.CartItemRequestDTO;
import nlu.com.app.dto.request.CreateOrderRequest;
import nlu.com.app.dto.response.CartItemResponseDTO;
import nlu.com.app.entity.Discount;
import nlu.com.app.repository.DiscountRepository;
import nlu.com.app.service.IOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/paypal")
public class PaypalController {
    private static final double EXCHANGE_RATE = 26040.0;
    private final DiscountRepository discountRepository;
    private final ObjectMapper objectMapper;
    private final PaypalServerSdkClient client;
    private final IOrderService orderService;
    private final List<Long> bookIds = new ArrayList<>();

    @Autowired
    public PaypalController(ObjectMapper objectMapper, PaypalServerSdkClient client, IOrderService orderService, DiscountRepository discountRepository) {
        this.objectMapper = objectMapper;
        this.client = client;
        this.orderService = orderService;
        this.discountRepository = discountRepository;
    }

    @PostMapping("/api/orders")
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = createOrderForPaypal(request);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Order createOrderForPaypal(CreateOrderRequest request) throws IOException, ApiException {
        List<Discount> discounts = discountRepository.findAllById(request.getListDiscountIds());

        // 1. Phân loại Discount
        List<Discount> itemLevelDiscounts = new ArrayList<>();
        List<Discount> orderLevelDiscounts = new ArrayList<>();
        if (discounts != null) {
            for (Discount d : discounts) {
                if (d.getTargetType() == EDiscountTarget.ORDER) orderLevelDiscounts.add(d);
                else itemLevelDiscounts.add(d);
            }
        }

        // 2. Map Request -> DTO
        List<CartItemResponseDTO.BookItemResponseDTO> listRequestBook = new ArrayList<>();
        List<CartItemResponseDTO.RewardItemResponseDTO> listRequestRedeem = new ArrayList<>();

        for (CartItemRequestDTO item : request.getItems()) {
            if (item.getTypePurchase().equals("BOOK")) {
                CartItemResponseDTO.BookItemResponseDTO book = objectMapper.convertValue(item.getItem(), CartItemResponseDTO.BookItemResponseDTO.class);
                listRequestBook.add(book);
            } else {
                CartItemResponseDTO.RewardItemResponseDTO redeem = objectMapper.convertValue(item.getItem(), CartItemResponseDTO.RewardItemResponseDTO.class);
                listRequestRedeem.add(redeem);
            }
        }
        List<Item> paypalItems = new ArrayList<>();
        double itemTotalUSD = 0.0;

        // --- XỬ LÝ BOOK ---
        for (CartItemResponseDTO.BookItemResponseDTO book : listRequestBook) {
            // Lấy giá gốc (đã trừ promotion admin nếu có)
            double currentPriceVND = book.getDiscountedPrice() != null ? book.getDiscountedPrice() : book.getPrice();

            // Áp dụng Item Discount (Nếu có)
            // Lưu ý: Logic check isBookEligibleForDiscount cần được implement hoặc giả định
            for (Discount d : itemLevelDiscounts) {
                if (d.getTargetType() == EDiscountTarget.BOOK) {
                    // Cần check condition của discount với book ở đây
                    // Giả sử thỏa mãn:
                    if (d.getDiscountType() == EDiscountType.PERCENT) {
                        currentPriceVND = currentPriceVND * (1 - d.getValue());
                    } else {
                        currentPriceVND = Math.max(0, currentPriceVND - d.getValue());
                    }
                }
            }

            // Convert sang USD và làm tròn
            double unitPriceUSD = Math.round((currentPriceVND / EXCHANGE_RATE) * 100.0) / 100.0;
            double lineTotalUSD = unitPriceUSD * book.getQuantity();
            itemTotalUSD += lineTotalUSD;

            // Format tên (cắt chuỗi 127 ký tự)
            String itemName = book.getTitle().length() > 127
                    ? book.getTitle().substring(0, 124) + "..."
                    : book.getTitle();

            paypalItems.add(new Item.Builder(
                    itemName,
                    new Money("USD", String.format(Locale.US, "%.2f", unitPriceUSD)),
                    String.valueOf(book.getQuantity())
            )
                    .sku(String.valueOf(book.getProductId()))
                    .category(ItemCategory.PHYSICAL_GOODS)
                    .build());
        }

        // --- XỬ LÝ REDEEM/REWARD ---
        for (CartItemResponseDTO.RewardItemResponseDTO redeem : listRequestRedeem) {
            double currentPriceVND = redeem.getPrice();

            // Áp dụng Discount Redeem (nếu có)
            for (Discount d : itemLevelDiscounts) {
                if (d.getTargetType() == EDiscountTarget.REDEEM) {
                    if (d.getDiscountType() == EDiscountType.PERCENT) {
                        currentPriceVND = currentPriceVND * (1 - d.getValue());
                    } else {
                        currentPriceVND = Math.max(0, currentPriceVND - d.getValue());
                    }
                }
            }

            double unitPriceUSD = Math.round((currentPriceVND / EXCHANGE_RATE) * 100.0) / 100.0;
            double lineTotalUSD = unitPriceUSD * redeem.getQuantity();
            itemTotalUSD += lineTotalUSD;

            String itemName = redeem.getTitle().length() > 127
                    ? redeem.getTitle().substring(0, 124) + "..."
                    : redeem.getTitle();

            paypalItems.add(new Item.Builder(
                    itemName,
                    new Money("USD", String.format(Locale.US, "%.2f", unitPriceUSD)),
                    String.valueOf(redeem.getQuantity())
            )
                    .sku(String.valueOf(redeem.getProductId()))
                    .category(ItemCategory.PHYSICAL_GOODS)
                    .build());
        }

        // 4. Tính toán Order Discount (trên tổng USD)
        double orderDiscountUSD = 0.0;

        for (Discount d : orderLevelDiscounts) {
            double discountVal = 0.0;

            // Check Min Order (quy đổi sang USD để so sánh hoặc quy đổi total sang VND)
            double minOrderUSD = d.getMinOrderAmount() / EXCHANGE_RATE;
            if (itemTotalUSD < minOrderUSD) continue;

            if (d.getDiscountType() == EDiscountType.PERCENT) {
                discountVal = itemTotalUSD * d.getValue();
            } else {
                // Fixed VND -> USD
                discountVal = d.getValue() / EXCHANGE_RATE;
            }
            orderDiscountUSD += discountVal;
        }

        // Làm tròn Discount Order
        orderDiscountUSD = Math.round(orderDiscountUSD * 100.0) / 100.0;

        // Đảm bảo không âm
        if (orderDiscountUSD > itemTotalUSD) orderDiscountUSD = itemTotalUSD;

        double finalTotalUSD = itemTotalUSD - orderDiscountUSD;
        // Fix sai số floating point lần cuối
        finalTotalUSD = Math.round(finalTotalUSD * 100.0) / 100.0;

        // 5. Build Request gửi PayPal
        AmountBreakdown breakdown = new AmountBreakdown.Builder()
                .itemTotal(new Money("USD", String.format(Locale.US, "%.2f", itemTotalUSD)))
                .discount(new Money("USD", String.format(Locale.US, "%.2f", orderDiscountUSD)))
                .build();

        AmountWithBreakdown amount = new AmountWithBreakdown.Builder("USD", String.format(Locale.US, "%.2f", finalTotalUSD))
                .breakdown(breakdown)
                .build();

        PurchaseUnitRequest unit = new PurchaseUnitRequest.Builder(amount)
                .items(paypalItems)
                .build();

        OrderRequest orderRequest = new OrderRequest.Builder(
                CheckoutPaymentIntent.CAPTURE,
                List.of(unit)
        ).build();

        CreateOrderInput input = new CreateOrderInput.Builder(null, orderRequest).build();
        return client.getOrdersController().createOrder(input).getResult();
    }


    private OrderRequest buildOrderRequest() {
        Money amountMoney = new Money("USD", "100");

        AmountBreakdown breakdown = new AmountBreakdown.Builder()
                .itemTotal(amountMoney)
                .build();

        AmountWithBreakdown amount = new AmountWithBreakdown.Builder("USD", "100")
                .breakdown(breakdown)
                .build();

        Item item = new Item.Builder("T-Shirt", amountMoney, "1")
                .description("Super Fresh Shirt")
                .sku("sku01")
                .category(ItemCategory.PHYSICAL_GOODS)
                .build();

        PurchaseUnitRequest unit = new PurchaseUnitRequest.Builder(amount)
                .items(Collections.singletonList(item))
                .build();

        return new OrderRequest.Builder(
                CheckoutPaymentIntent.CAPTURE,
                Collections.singletonList(unit)
        ).build();
    }

    @PostMapping("/api/orders/{orderID}/capture")
    public ResponseEntity<Order> captureOrder(@PathVariable String orderID, @RequestBody CreateOrderRequest request) {
        try {

            Order order = captureOrders(orderID, request);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Order captureOrders(String orderID, CreateOrderRequest request) throws IOException, ApiException {
        CaptureOrderInput input = new CaptureOrderInput.Builder(orderID, null).build();
        ApiResponse<Order> response = client.getOrdersController().captureOrder(input);

        // Lấy Order Result từ response
        Order resultOrder = response.getResult();

        //
        // Cấu trúc: purchase_units[0] -> payments -> captures[0] -> id
        String realCaptureId = "";

        if (resultOrder.getPurchaseUnits() != null && !resultOrder.getPurchaseUnits().isEmpty()) {
            PurchaseUnit unit = resultOrder.getPurchaseUnits().get(0);
            if (unit.getPayments() != null && unit.getPayments().getCaptures() != null
                    && !unit.getPayments().getCaptures().isEmpty()) {
                realCaptureId = unit.getPayments().getCaptures().get(0).getId();
            }
        }

        // 3. Truyền realCaptureId này vào service để lưu xuống DB (thay vì orderID)
        // orderID cũ chỉ là Order ID thôi, không refund được đâu!
        orderService.createOrderFromCartByPaypal(
                request.getItems(),
                4L,
                request.getListDiscountIds(),
                realCaptureId // <--- Truyền cái này nhé
        );

        return resultOrder;
    }
}
