package nlu.com.app.repository;

import nlu.com.app.constant.EStatusMessage;
import nlu.com.app.dto.response.AdminConversationInboxResponseDTO;
import nlu.com.app.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByClient_UserId(Long userId);

    List<Conversation> findAllByStatusIn(
            List<EStatusMessage> statuses
    );

    Optional<Conversation> findById(Long id);

    @Query("""
            SELECT new nlu.com.app.dto.response.AdminConversationInboxResponseDTO(
                c.id,
                u.userId,
                u.username,
                ch.message,
                ch.createdDate,
               CAST(c.status AS string),
                ca.username
            )
            FROM Conversation c
            JOIN c.client u
            LEFT JOIN c.currentAdmin ca
            LEFT JOIN ChatHistory ch
               ON ch.id = (
                  SELECT ch2.id FROM ChatHistory ch2
                  WHERE ch2.conversation_chat_history = c
                  ORDER BY ch2.createdDate DESC
                  LIMIT 1
               )
            ORDER BY ch.createdDate DESC
            """)
    List<AdminConversationInboxResponseDTO> findInboxForAdmin();


}
