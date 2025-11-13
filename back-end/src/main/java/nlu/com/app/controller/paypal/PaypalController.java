package nlu.com.app.controller.paypal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paypal.sdk.PaypalServerSdkClient;
import com.paypal.sdk.exceptions.ApiException;
import com.paypal.sdk.http.response.ApiResponse;
import com.paypal.sdk.models.*;
import nlu.com.app.dto.paypal.ListBookChosenPayPalRequestDTO;
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
import java.util.*;

@RestController
@RequestMapping("/paypal")
public class PaypalController {
    private final DiscountRepository discountRepository;
    private final ObjectMapper objectMapper;
    private final PaypalServerSdkClient client;
    private final IOrderService orderService;
    private List<Long> bookIds = new ArrayList<>();
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
        // Danh sách các item đã chuyển đổi sang USD và làm tròn 2 chữ số sau dấu phẩy
        List<Item> items = new ArrayList<>();
        double itemTotalUSD = 0.0;

        for (CartItemResponseDTO.BookItemResponseDTO item : listRequestBook) {
//            Cần giới hạn lại đồ dài của tên sách do yêu cầu của Paypal khong cho phep quá 127 ky tự
            String itemName = item.getTitle();
            if (itemName.length() > 127) {
                itemName = itemName.substring(0, 124) + "...";
            }
            double unitPriceUSD = item.getDiscountedPrice() / 26040.0;
            unitPriceUSD = Math.round(unitPriceUSD * 100.0) / 100.0; // làm tròn 2 chữ số

            double totalItemUSD = unitPriceUSD * item.getQuantity();
            itemTotalUSD += totalItemUSD;

            items.add(new Item.Builder(
                    itemName,
                    new Money("USD", String.format(Locale.US, "%.2f", unitPriceUSD)),

                    String.valueOf(item.getQuantity())
            )
                    .sku(String.valueOf(item.getProductId()))
                    .description(item.getTitle())
                    .category(ItemCategory.PHYSICAL_GOODS)
                    .build());
        }
        for (CartItemResponseDTO.RewardItemResponseDTO item : listRequestRedeem) {
//            Cần giới hạn lại đồ dài của tên sách do yêu cầu của Paypal khong cho phep quá 127 ky tự
            String itemName = item.getTitle();
            if (itemName.length() > 127) {
                itemName = itemName.substring(0, 124) + "...";
            }
            double unitPriceUSD = item.getPrice() / 26040.0;
            unitPriceUSD = Math.round(unitPriceUSD * 100.0) / 100.0; // làm tròn 2 chữ số

            double totalItemUSD = unitPriceUSD * item.getQuantity();
            itemTotalUSD += totalItemUSD;

            items.add(new Item.Builder(
                    itemName,
                    new Money("USD", String.format(Locale.US, "%.2f", unitPriceUSD)),

                    String.valueOf(item.getQuantity())
            )
                    .sku(String.valueOf(item.getProductId()))
                    .description(item.getTitle())
                    .category(ItemCategory.PHYSICAL_GOODS)
                    .build());
        }
        double amountDecreased = 0.0;
        //        Kiểm tra có giảm giá theo ORDER ko
        if (discounts != null && !discounts.isEmpty()) {
            for(Discount discount : discounts) {
                Double discountValue = discount.getValue();
                switch (discount.getDiscountType()) {
                    case PERCENT:
                        amountDecreased= (itemTotalUSD * discountValue);
                        break;
                    case FIXED:
                        amountDecreased = Math.round((discountValue/ 26040.0) * 100.0) / 100.0;
                        break;
                }
            }
            amountDecreased = Math.round(amountDecreased * 100.0) / 100.0;
       

        }


        double finalAmountUSD = itemTotalUSD -amountDecreased;



        Money totalMoney = new Money("USD", String.format(Locale.US, "%.2f", finalAmountUSD));

        AmountBreakdown breakdown = new AmountBreakdown.Builder()
                .itemTotal(new Money("USD", String.format(Locale.US, "%.2f", itemTotalUSD))) // tổng trước giảm
                .discount(new Money("USD", String.format(Locale.US, "%.2f", amountDecreased))) // số tiền giảm
                .build();


        AmountWithBreakdown amount = new AmountWithBreakdown.Builder("USD", String.format(Locale.US, "%.2f", finalAmountUSD))
                .breakdown(breakdown)
                .build();


        PurchaseUnitRequest unit = new PurchaseUnitRequest.Builder(amount)
                .items(items)
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
                .items(Arrays.asList(item))
                .build();

        return new OrderRequest.Builder(
                CheckoutPaymentIntent.CAPTURE,
                Arrays.asList(unit)
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

    private Order captureOrders(String orderID , CreateOrderRequest request) throws IOException, ApiException {
        CaptureOrderInput input = new CaptureOrderInput.Builder(orderID, null).build();
        ApiResponse<Order> response = client.getOrdersController().captureOrder(input);
        orderService.createOrderFromCart(request.getItems(), 4L, request.getListDiscountIds());
        return response.getResult();
    }
}
