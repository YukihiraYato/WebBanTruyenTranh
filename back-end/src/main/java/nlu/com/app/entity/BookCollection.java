package nlu.com.app.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "book_collections")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookCollection {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "collection_id")
  private Long collectionId;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "name")
  private String name;

  @Column(name = "description")
  private String description;

  @Column(name = "created_date")
  private LocalDate createdDate;

  @Column(name = "is_public")
  private Boolean isPublic;

  @OneToMany(mappedBy = "collection", cascade = CascadeType.ALL)
  private List<BookCollectionItem> items = new ArrayList<>();
}
