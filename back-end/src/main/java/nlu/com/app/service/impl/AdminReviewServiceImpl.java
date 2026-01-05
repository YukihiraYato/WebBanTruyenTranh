package nlu.com.app.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.request.ReviewFilterRequest;
import nlu.com.app.dto.response.AdminReviewResponse;
import nlu.com.app.entity.UserDetails;
import nlu.com.app.entity.UserReview;
import nlu.com.app.repository.UserDetailsRepository;
import nlu.com.app.repository.UserReviewRepository;
import nlu.com.app.service.AdminReviewService;
import nlu.com.app.specification.UserReviewSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminReviewServiceImpl implements AdminReviewService {
    private final UserReviewRepository reviewRepository;
    private final UserDetailsRepository userDetailsRepository;

    @Override
    public Page<AdminReviewResponse> getReviews(ReviewFilterRequest filter, Pageable pageable) {
        Page<UserReview> pageResult = reviewRepository.findAll(UserReviewSpecification.getFilter(filter), pageable);
        return pageResult.map(this::mapToDTO);
    }

    @Override
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new RuntimeException("Review not found with id: " + reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    private AdminReviewResponse mapToDTO(UserReview entity) {
        String targetName = "Unknown";
        String targetImage = "";
        if (entity.getBook() != null) {
            targetName = entity.getBook().getTitle();
            targetImage = entity.getBook().getImages().get(0).getImageUrl();
        } else if (entity.getCollection() != null) {
            targetName = entity.getCollection().getName();
            targetImage = entity.getCollection().getImage();
        }

        UserDetails userDetails = userDetailsRepository.findByUser_UserId(entity.getUser().getUserId()).orElse(null);
        String userName = userDetails.getFullname() != null ? userDetails.getFullname() : "Anonymous";
        String userEmail = entity.getUser() != null ? entity.getUser().getEmail() : "";

        return AdminReviewResponse.builder()
                .reviewId(entity.getReviewId())
                .userName(userName)
                .userEmail(userEmail)
                .targetName(targetName)
                .targetType(entity.getReviewType().name())
                .rating(entity.getRating())
                .reviewText(entity.getReviewText())
                .reviewDate(entity.getReviewDate())
                .targetImage(targetImage)
                .build();
    }
}
