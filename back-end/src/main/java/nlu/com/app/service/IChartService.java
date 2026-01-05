package nlu.com.app.service;

import nlu.com.app.dto.response.*;

/**
 * @author Nguyen Tuan
 */
public interface IChartService {
    SalesMonthlyReportResponseDTO getSalesMonthlyReport(Integer reqYear);

    RecentlyOrderResponseDTO getRecentlyOrder();

    SummaryDashboardResponseDTO getSummaryDashboard(Integer reqMonth, Integer reqYear);

    UserDetailsSummaryChartDTO getUserDetailsSummaryChart(Long userId);

    TopSellingProductDTO getTopSellingProducts(int year, int month);
}
