package nlu.com.app.repository;

import nlu.com.app.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByClient_UserId(Long userId);
}
