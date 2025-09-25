package nlu.com.app.repository;

import nlu.com.app.entity.ChatHistory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    Optional<List<ChatHistory>> findByUser_UserIdOrderByCreatedDateAsc(Long userId);
    Optional<List<ChatHistory>> findByUser_UserIdAndIsReadFalseOrderByCreatedDateAsc(Long userId);
    Long countByUser_UserIdAndIsReadFalse(Long userId);
    @Query(value = "Select c from chat_history c where c.user_id = :userId order by c.created_date desc limit 1", nativeQuery = true)
    Optional<ChatHistory> findTheLastChatHistoryByUserId(@Param("userId") Long userId);
    @Query(value = "update chat_history c set c.is_read = true where c.user_id = :userId", nativeQuery = true)
    void updateIsReadByUserId(@Param("userId") Long userId);
    @Query(value = "Select c from chat_history c where c.user_id = :userId order by c.created_date desc limit 10", nativeQuery = true)
    List<ChatHistory> getTop10ByUserIdOrderByCreatedAtDesc(String userId);
}
