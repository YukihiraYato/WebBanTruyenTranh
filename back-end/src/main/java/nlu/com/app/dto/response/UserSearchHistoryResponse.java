package nlu.com.app.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class UserSearchHistoryResponse {
    private String keyword;
    private LocalDateTime searchedAt;
    private Integer searchCount;
}
