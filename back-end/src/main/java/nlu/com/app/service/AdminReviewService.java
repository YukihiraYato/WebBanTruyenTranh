package nlu.com.app.service;

import nlu.com.app.dto.request.ReviewFilterRequest;
import nlu.com.app.dto.response.AdminReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminReviewService {
    Page<AdminReviewResponse> getReviews(ReviewFilterRequest filter, Pageable pageable);

    void deleteReview(Long reviewId);

}
