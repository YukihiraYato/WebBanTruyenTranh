package nlu.com.app.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import nlu.com.app.dto.request.ReviewFilterRequest;
import nlu.com.app.entity.Book;
import nlu.com.app.entity.BookCollection;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserReview;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class UserReviewSpecification {
    public static Specification<UserReview> getFilter(ReviewFilterRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Join các bảng để lấy dữ liệu tìm kiếm
            Join<UserReview, User> userJoin = root.join("user", JoinType.LEFT);
            Join<UserReview, Book> bookJoin = root.join("book", JoinType.LEFT);
            Join<UserReview, BookCollection> collectionJoin = root.join("collection", JoinType.LEFT);

            // 2. Lọc theo Keyword (Tìm trong Tên User, Tên Sách, hoặc Tên Collection)
            if (StringUtils.hasText(request.getKeyword())) {
                String keyword = "%" + request.getKeyword().toLowerCase() + "%";
                Predicate searchUser = cb.like(cb.lower(userJoin.get("fullName")), keyword); // Giả sử User có fullName
                Predicate searchBook = cb.like(cb.lower(bookJoin.get("title")), keyword);    // Giả sử Book có title
                Predicate searchCol = cb.like(cb.lower(collectionJoin.get("name")), keyword);// Giả sử Collection có name

                predicates.add(cb.or(searchUser, searchBook, searchCol));
            }

            // 3. Lọc theo Loại (Book/Collection)
            if (request.getType() != null) {
                predicates.add(cb.equal(root.get("reviewType"), request.getType()));
            }

            // 4. Lọc theo Rating (Ví dụ: tìm rating <= minRating để lọc review xấu)
            if (request.getMinRating() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), request.getMinRating()));
            }

            // 5. Lọc theo ngày
            if (request.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("reviewDate"), request.getFromDate()));
            }
            if (request.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("reviewDate"), request.getToDate()));
            }

            // Sắp xếp mặc định: Mới nhất lên đầu
            query.orderBy(cb.desc(root.get("reviewDate")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
