package nlu.com.app.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import nlu.com.app.constant.EUserStatus;
import nlu.com.app.constant.UserRole;
import nlu.com.app.dto.request.FilterUserDetailsRequestDTO;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserDetails;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> filterUsers(FilterUserDetailsRequestDTO request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Join với bảng UserDetails (LEFT JOIN để lấy cả user chưa có detail)
            Join<User, UserDetails> detailsJoin = root.join("userDetails", JoinType.LEFT);

            // 2. Lọc theo Keyword (Tìm trong username, email, fullname, sđt)
            if (StringUtils.hasText(request.getKeyword())) {
                String searchKey = "%" + request.getKeyword().toLowerCase().trim() + "%";

                Predicate searchByUsername = cb.like(cb.lower(root.get("username")), searchKey);
                Predicate searchByEmail = cb.like(cb.lower(root.get("email")), searchKey);

                // Cần check null cho bảng joined phòng trường hợp user chưa có detail
                Predicate searchByFullname = cb.like(cb.lower(detailsJoin.get("fullname")), searchKey);
                Predicate searchByPhone = cb.like(detailsJoin.get("phoneNum"), searchKey);

                predicates.add(cb.or(searchByUsername, searchByEmail, searchByFullname, searchByPhone));
            }

            // 3. Lọc theo Status
            if (StringUtils.hasText(request.getStatus())) {
                try {
                    EUserStatus status = EUserStatus.valueOf(request.getStatus().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), status));
                } catch (IllegalArgumentException e) {
                    // Bỏ qua nếu status gửi lên không đúng định dạng Enum
                }
            }

            // 4. Lọc theo Role
            if (StringUtils.hasText(request.getRole())) {
                try {
                    UserRole role = UserRole.valueOf(request.getRole().toUpperCase());
                    predicates.add(cb.equal(root.get("role"), role));
                } catch (IllegalArgumentException e) {
                    // Bỏ qua nếu role không hợp lệ
                }
            }

            // Group lại điều kiện và query
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}