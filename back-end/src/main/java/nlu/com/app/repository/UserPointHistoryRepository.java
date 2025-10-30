package nlu.com.app.repository;

import nlu.com.app.entity.UserPointHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPointHistoryRepository extends JpaRepository<UserPointHistory, Long> {
    Page<UserPointHistory> findAllByUserPoint_UserPointId(Long userPointId, Pageable pageable);
}
