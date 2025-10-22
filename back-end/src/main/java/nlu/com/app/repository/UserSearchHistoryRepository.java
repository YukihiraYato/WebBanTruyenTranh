package nlu.com.app.repository;

import nlu.com.app.entity.UserSearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
@Repository
public interface UserSearchHistoryRepository extends JpaRepository<UserSearchHistory, Long> {
    List<UserSearchHistory> findTop10ByUser_UserIdOrderBySearchedAtDesc(Long userId);

    Optional<UserSearchHistory> findByUser_UserIdAndKeyword(Long userId, String keyword);
    void deleteByUser_UserIdAndKeyword(Long userId, String keyword);
}
