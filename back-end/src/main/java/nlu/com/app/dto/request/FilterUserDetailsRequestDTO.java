package nlu.com.app.dto.request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FilterUserDetailsRequestDTO {
    private String keyword;
    private String status;
    private String role;
}
