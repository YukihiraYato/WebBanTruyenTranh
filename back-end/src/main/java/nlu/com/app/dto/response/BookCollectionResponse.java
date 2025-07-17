package nlu.com.app.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookCollectionResponse {
  private Long id;
  private String name;
  private String description;
  private String coverImage;
  private boolean isPublic;
  private String createdDate;
  private Integer totalBook;
  private String fullName;
}
