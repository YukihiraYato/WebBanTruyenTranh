package nlu.com.app.controller.paypal;

import com.paypal.sdk.PaypalServerSdkClient;
import com.paypal.sdk.exceptions.ApiException;
import com.paypal.sdk.http.response.ApiResponse;
import com.paypal.sdk.models.*;
import lombok.RequiredArgsConstructor;
import nlu.com.app.constant.EUserRank;
import nlu.com.app.dto.paypal.ListBookChosenPayPalRequestDTO;
import nlu.com.app.dto.request.TopUpWbPointRequestDTO;
import nlu.com.app.entity.Discount;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserPoint;
import nlu.com.app.entity.UserPointHistory;
import nlu.com.app.repository.UserPointHistoryRepository;
import nlu.com.app.repository.UserPointRepository;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/user-point-paypal")
@RequiredArgsConstructor
@Transactional
public class UserPointPaypalController {
    private final PaypalServerSdkClient client;
    private final UserPointRepository userPointRepository;
    private final UserRepository userRepository;
    private final UserPointHistoryRepository userPointHistoryRepository;
    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@RequestBody TopUpWbPointRequestDTO topUpWbPointRequestDTO) {
        try {
            Order order = createOrderForPaypal(topUpWbPointRequestDTO);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    @PostMapping("/orders/{orderID}/capture")
    public ResponseEntity<Order> captureOrder(@PathVariable String orderID,@RequestBody TopUpWbPointRequestDTO topUpWbPointRequestDTO) {
        try {
            Order order = captureOrders(orderID,topUpWbPointRequestDTO);
            return new ResponseEntity<>(order, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Order createOrderForPaypal(TopUpWbPointRequestDTO topUpWbPointRequestDTO) throws IOException, ApiException {
        // ====== Du lieu Fe gui ve ======
        int quantity = topUpWbPointRequestDTO.getAmount();       // số lượng gói
        double unitPriceVND = topUpWbPointRequestDTO.getValue(); // giá 1 gói (VND)
        String nameTopUp = topUpWbPointRequestDTO.getNameTopUp();

        // ====== Tính toán giá USD ======
        BigDecimal exchangeRate = new BigDecimal("26040"); // 1 USD = 26,040 VND
        BigDecimal unitPriceUSD = BigDecimal.valueOf(unitPriceVND)
                .divide(exchangeRate, 2, RoundingMode.HALF_UP); // giá 1 gói theo USD

        BigDecimal totalPriceUSD = unitPriceUSD
                .multiply(BigDecimal.valueOf(quantity))
                .setScale(2, RoundingMode.HALF_UP); // tổng USD

        // ====== Tạo item gửi PayPal ======
        Item item = new Item.Builder()
                .name(nameTopUp)
                .quantity(String.valueOf(quantity))
                .unitAmount(new Money("USD", unitPriceUSD.toPlainString()))
                .build();

        // ====== Tổng tiền (tổng breakdown) ======
        Money totalMoney = new Money("USD", totalPriceUSD.toPlainString());

        AmountBreakdown breakdown = new AmountBreakdown.Builder()
                .itemTotal(totalMoney)
                .build();

        AmountWithBreakdown amount = new AmountWithBreakdown.Builder("USD", totalPriceUSD.toPlainString())
                .breakdown(breakdown)
                .build();

        // ====== Purchase Unit ======
        PurchaseUnitRequest purchaseUnit = new PurchaseUnitRequest.Builder(amount)
                .items(List.of(item))
                .build();

        // ====== Order Request ======
        OrderRequest orderRequest = new OrderRequest.Builder(
                CheckoutPaymentIntent.CAPTURE,
                List.of(purchaseUnit)
        ).build();

        // ====== Gọi API PayPal ======
        CreateOrderInput input = new CreateOrderInput.Builder(null, orderRequest).build();
        return client.getOrdersController().createOrder(input).getResult();
    }

    private Order captureOrders(String orderID, TopUpWbPointRequestDTO topUpWbPointRequestDTO) throws IOException, ApiException {
        String username = SecurityUtils.getCurrentUsername();
        User user = userRepository.findByUsername(username).get();
        UserPoint userPoint = userPointRepository.findByUser_UserId(user.getUserId()).orElseGet(
                ()->{
                    UserPoint newPoint = new UserPoint();
                    newPoint.setUser(user);
                    newPoint.setUserRank(EUserRank.Bronze);
                    newPoint.setTotalPoint(0.0); // khởi tạo mặc định
                    return userPointRepository.save(newPoint);

                }
        );
        double totalPrice = topUpWbPointRequestDTO.getValue() * topUpWbPointRequestDTO.getAmount();
        userPoint.setTotalPoint(userPoint.getTotalPoint()+ totalPrice);
        userPointRepository.save(userPoint);

        UserPointHistory userPointHistory = new UserPointHistory();
        userPointHistory.setUserPoint(userPoint);
        userPointHistory.setPointsChange(totalPrice);
        userPointHistory.setDescription("Quý khác vừa nạp thêm: +"+ totalPrice);
        userPointHistoryRepository.save(userPointHistory);


        CaptureOrderInput input = new CaptureOrderInput.Builder(String.valueOf(orderID), null).build();
        ApiResponse<Order> response = client.getOrdersController().captureOrder(input);
        return response.getResult();
    }
}

