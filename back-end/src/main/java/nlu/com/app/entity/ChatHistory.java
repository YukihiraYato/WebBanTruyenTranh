package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import nlu.com.app.constant.ERole;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_history")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatHistory {
    @Id
    @GeneratedValue
    @Column(name = "id")
    Long id;
    @JoinColumn(name = "user_id")
    @ManyToOne(fetch =  FetchType.LAZY)
    User user;
    @Column(name ="sender_id")
    String senderId;
    @Lob
    @Column(name = "message", columnDefinition = "TEXT")
    String message;
    @Column(name = "created_date", columnDefinition = "DATETIME(0)")
    LocalDateTime createdDate;
    @Column(name = "is_read")
    Boolean isRead;
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    ERole role;
    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    Conversation conversation_chat_history;

}
