package nlu.com.app.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import nlu.com.app.constant.EOrderStatus;
import nlu.com.app.constant.UserRole;
import nlu.com.app.dto.response.*;
import nlu.com.app.entity.Book;
import nlu.com.app.entity.Order;
import nlu.com.app.entity.OrderItem;
import nlu.com.app.entity.User;
import nlu.com.app.mapper.ChartMapper;
import nlu.com.app.repository.OrderItemRepository;
import nlu.com.app.repository.OrderRepository;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.IChartService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ChartService implements IChartService {
    OrderRepository orderRepository;
    UserRepository userRepository;
    ChartMapper chartMapper;
    OrderItemRepository orderItemRepository;

    @Override
    public SalesMonthlyReportResponseDTO getSalesMonthlyReport(Integer reqYear) {
        // Nếu không truyền năm, lấy năm hiện tại
        int year = (reqYear != null) ? reqYear : LocalDate.now().getYear();
        String[] months = {"Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"};
        double[] monthlyTotals = new double[12];

        List<Order> completedOrders = orderRepository.findByStatusAndYear(EOrderStatus.DELIVERED, year);
        for (Order order : completedOrders) {
            int monthIndex = order.getDeliveredDate().getMonthValue() - 1;
            monthlyTotals[monthIndex] += order.getTotalAmount();
        }

        List<SalesMonthlyReportResponseDTO.Sale> result = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            var s = SalesMonthlyReportResponseDTO.Sale.builder()
                    .name(months[i])
                    .total(Math.round(monthlyTotals[i] * 10) / 10.0)
                    .build();
            result.add(s);
        }
        return SalesMonthlyReportResponseDTO.builder()
                .sales(result)
                .build();
    }

    @Override
    public RecentlyOrderResponseDTO getRecentlyOrder() {
        // Query này của bạn đã tốt rồi (có lọc theo month/year), chỉ cần truyền biến vào là xong
        int totalOrdersInMonth = orderRepository.countByOrderDateMonthAndYear(LocalDate.now().getMonthValue(), LocalDate.now().getYear(), EOrderStatus.DELIVERED);
        // Lấy 5 đơn hàng gần nhất có trạng thái "Hoàn thành"
        List<Order> recentOrders = orderRepository.findRecentOrdersInMonth(
                EOrderStatus.DELIVERED,
                LocalDate.now().getMonthValue(),
                LocalDate.now().getYear(),
                PageRequest.of(0, 5)
        );

        List<RecentlyOrderResponseDTO.Order> dtoOrders = new ArrayList<>();
        for (Order order : recentOrders) {
            User user = order.getUser();
            dtoOrders.add(RecentlyOrderResponseDTO.Order.builder()
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .totalAmount(Math.round(order.getTotalAmount())) // Làm tròn thành số nguyên
                    .build());
        }

        return RecentlyOrderResponseDTO.builder()
                .recentlyOrders(dtoOrders)
                .totalOrdersInMonth(totalOrdersInMonth)
                .build();
    }

    public SummaryDashboardResponseDTO getSummaryDashboard(Integer reqMonth, Integer reqYear) {
        // 1. Xác định thời gian
        LocalDate targetDate = (reqMonth != null && reqYear != null)
                ? LocalDate.of(reqYear, reqMonth, 1)
                : LocalDate.now();

        int thisMonth = targetDate.getMonthValue();
        int thisYear = targetDate.getYear();

        LocalDate prevDate = targetDate.minusMonths(1);
        int prevMonth = prevDate.getMonthValue();
        int prevYear = prevDate.getYear();

        // ==========================================
        // 1. PROFIT (Doanh thu)
        // ==========================================

        long totalProfit = orderRepository.sumTotalRevenue(EOrderStatus.DELIVERED);
        long thisMonthProfit = orderRepository.sumRevenueByMonth(thisMonth, thisYear, EOrderStatus.DELIVERED);
        long prevMonthProfit = orderRepository.sumRevenueByMonth(prevMonth, prevYear, EOrderStatus.DELIVERED);

        float profitDiff = prevMonthProfit == 0 ? 0f
                : ((float) (thisMonthProfit - prevMonthProfit) / prevMonthProfit) * 100;

        // ==========================================
        // 2. ORDER (Số lượng đơn)
        // ==========================================
        long totalOrders = orderRepository.countByStatus(EOrderStatus.DELIVERED); // Hàm có sẵn của JPA
        long thisMonthOrder = orderRepository.countOrdersByMonth(thisMonth, thisYear, EOrderStatus.DELIVERED);
        long prevMonthOrder = orderRepository.countOrdersByMonth(prevMonth, prevYear, EOrderStatus.DELIVERED);

        float orderDiff = prevMonthOrder == 0 ? 0f
                : ((float) (thisMonthOrder - prevMonthOrder) / prevMonthOrder) * 100;

        // ==========================================
        // 3. CUSTOMER (Khách hàng)
        // ==========================================
        long totalCustomer = userRepository.countByRole(UserRole.CUSTOMER);
        long thisMonthCustomer = userRepository.countNewCustomers(thisMonth, thisYear, UserRole.CUSTOMER);
        long prevMonthCustomer = userRepository.countNewCustomers(prevMonth, prevYear, UserRole.CUSTOMER);

        float customerDiff = prevMonthCustomer == 0 ? 0f
                : ((float) (thisMonthCustomer - prevMonthCustomer) / prevMonthCustomer) * 100;

        // ==========================================
        // 4. MOST SOLD PRODUCT (Chỉ load đơn tháng này)
        // ==========================================
        // Ở đây chúng ta mới cần load List<Order>, nhưng chỉ load ĐÚNG tháng được chọn
        List<Order> ordersThisMonth = orderRepository.findByStatusAndMonth(EOrderStatus.DELIVERED, thisMonth, thisYear);

        SummaryDashboardResponseDTO.Product mostSellProduct = null;

        // Logic tìm sản phẩm bán chạy giữ nguyên, nhưng giờ nó chạy trên tập dữ liệu rất nhỏ (chỉ 1 tháng) -> Rất nhanh
        if (!ordersThisMonth.isEmpty()) {
            Map<Book, Integer> bookSoldMap = new HashMap<>();
            for (Order order : ordersThisMonth) {
                for (OrderItem item : order.getOrderItems()) {
                    Book book = item.getBook();
                    bookSoldMap.put(book, bookSoldMap.getOrDefault(book, 0) + item.getQuantity());
                }
            }
            if (!bookSoldMap.isEmpty()) {
                var maxEntry = Collections.max(bookSoldMap.entrySet(), Map.Entry.comparingByValue());
                Book bestBook = maxEntry.getKey();
                mostSellProduct = SummaryDashboardResponseDTO.Product.builder()
                        .title(maxEntry.getKey().getTitle())
                        .soldAmount(maxEntry.getValue())
                        .thumbnail(bestBook.getImages().isEmpty() ? null : bestBook.getImages().get(0).getImageUrl())
                        .build();
            }
        }

        // Build Response
        return SummaryDashboardResponseDTO.builder()
                .profit(SummaryDashboardResponseDTO.Profit.builder()
                        .total(totalProfit)
                        .thisMonth(thisMonthProfit)
                        .diffPercent(profitDiff)
                        .build())
                .order(SummaryDashboardResponseDTO.Order.builder()
                        .total(totalOrders)
                        .thisMonth(thisMonthOrder)
                        .diffPercent(orderDiff)
                        .build())
                .customer(SummaryDashboardResponseDTO.Customer.builder()
                        .total(totalCustomer)
                        .thisMonth(thisMonthCustomer)
                        .diffPercent(customerDiff)
                        .build())
                .mostSellInMonth(mostSellProduct)
                .build();
    }

    @Override
    public UserDetailsSummaryChartDTO getUserDetailsSummaryChart(Long userId) {
        Integer totalOrders = orderRepository.countDeliveredOrdersByUserId(userId);
        Double totalPayAmounts = orderRepository.sumDeliveredTotalAmountByUserId(userId);

        List<Object[]> dbResults = orderRepository.sumDeliveredAmountGroupByMonth(userId);
        List<UserDetailsSummaryChartDTO.PayInMonth> frequency = buildFull12MonthFrequency(dbResults);

        return chartMapper.toDto(
                totalOrders,
                totalPayAmounts != null ? totalPayAmounts.intValue() : 0,
                frequency
        );
    }

    private List<UserDetailsSummaryChartDTO.PayInMonth> buildFull12MonthFrequency(List<Object[]> dbResults) {
        // Map dữ liệu DB: key = tháng (1-12), value = tổng tiền
        Map<Integer, Long> monthAmountMap = new HashMap<>();
        for (Object[] row : dbResults) {
            String monthStr = (String) row[0]; // ví dụ: "2025-04"
            int month = Integer.parseInt(monthStr.split("-")[1]); // lấy số tháng
            Long amount = row[1] == null ? 0L : ((Number) row[1]).longValue();
            monthAmountMap.put(month, amount);
        }

        List<UserDetailsSummaryChartDTO.PayInMonth> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String name = "th" + m;
            Long amount = monthAmountMap.getOrDefault(m, 0L);
            result.add(new UserDetailsSummaryChartDTO.PayInMonth(name, amount));
        }
        return result;
    }

    @Override
    public TopSellingProductDTO getTopSellingProducts(int year, int month) {
        List<Object[]> raw = orderItemRepository.findTopSellingBooks(year, month);

        List<TopSellingProductDTO.Element> elements = new ArrayList<>();
        int total = Math.min(raw.size(), 5);

        for (int i = 0; i < raw.size(); i++) {
            Object[] row = raw.get(i);
            Long bookId = (Long) row[0];
            String title = (String) row[1];
            String thumbnail = (String) row[2];
            Integer quantity = ((Number) row[3]).intValue();
            Long lastOrderId = (Long) row[4];
            LocalDate lastSellDate = ((LocalDateTime) row[5]).toLocalDate();

            if (i < 4) {
                elements.add(
                        TopSellingProductDTO.Element.builder()
                                .top(i + 1)
                                .showName(title)
                                .product(
                                        TopSellingProductDTO.Element.ProductInfo.builder()
                                                .productId(bookId)
                                                .productName(title)
                                                .thumbnail(thumbnail)
                                                .lastOrderId(lastOrderId)
                                                .quantity(quantity)
                                                .lastSellDate(lastSellDate.format(DateTimeFormatter.ofPattern("dd-MM-YYYY")))
                                                .build()
                                )
                                .build()
                );
            }
            // "Others" xử lý như trước, không cần lastOrderId/lastSellDate
        }

        if (raw.size() > 4) {
            elements.add(
                    TopSellingProductDTO.Element.builder()
                            .top(5)
                            .showName("Còn lại")
                            .product(null)
                            .build()
            );
            total = 5;
        }

        return TopSellingProductDTO.builder()
                .totalElements(total)
                .elements(elements)
                .build();
    }
}
