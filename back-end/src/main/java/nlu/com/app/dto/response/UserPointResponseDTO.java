package nlu.com.app.dto.response;

import lombok.Getter;
import lombok.Setter;
import nlu.com.app.constant.EUserRank;
import nlu.com.app.entity.UserPointHistory;

import java.util.List;

@Getter
@Setter
public class UserPointResponseDTO {
    private Long userPointId;
    private Double totalPoint;
    private EUserRank userRank;
    private Long userId;
    private Double nextRankPoint;
    private Double lifetimePoint;
    private List<UserPointHistory> userPointHistories;
}
