package nlu.com.app.dto.response;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDTO {
    private Long user_id;   // user
    private List<Long> recommendations;   // book (sản phẩm)

}
