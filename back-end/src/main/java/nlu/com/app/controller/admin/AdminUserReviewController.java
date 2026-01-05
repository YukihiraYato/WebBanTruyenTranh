package nlu.com.app.controller.admin;

import lombok.RequiredArgsConstructor;
import nlu.com.app.constant.ReviewType;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.ReviewFilterRequest;
import nlu.com.app.dto.response.AdminReviewResponse;
import nlu.com.app.service.AdminReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/admin/user-review")
@RequiredArgsConstructor
public class AdminUserReviewController {
    private final AdminReviewService adminReviewService;

    @GetMapping
    public AppResponse<Page<AdminReviewResponse>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ReviewType type,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate
    ) {
        // Gom tham số vào Object Filter
        ReviewFilterRequest filter = new ReviewFilterRequest();
        filter.setKeyword(keyword);
        filter.setType(type);
        filter.setMinRating(minRating);
        filter.setFromDate(fromDate);
        filter.setToDate(toDate);

        Pageable pageable = PageRequest.of(page, size);

        return AppResponse.<Page<AdminReviewResponse>>builder()
                .result(adminReviewService.getReviews(filter, pageable))
                .build();
    }

    /**
     * API Xóa Review
     * URL: DELETE /api/admin/reviews/{id}
     */
    @DeleteMapping("/{id}")
    public AppResponse<String> deleteReview(@PathVariable Long id) {
        adminReviewService.deleteReview(id);
        return AppResponse.<String>builder()
                .result("Delete review successfully")
                .build();
    }
}
