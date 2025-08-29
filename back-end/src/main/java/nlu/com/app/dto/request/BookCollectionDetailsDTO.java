package nlu.com.app.dto.request;

import java.time.LocalDate;
import java.util.List;
import lombok.Builder;
import lombok.Data;
import nlu.com.app.entity.User;

@Data
@Builder
public class BookCollectionDetailsDTO {
  private Long id;
  private String name;
  private String description;
  private LocalDate createdDate;
  private List<BookInCollectionDTO> books;
  private String userName;
  private Boolean isPublic;
  private Long userId;
  private String image;
}

