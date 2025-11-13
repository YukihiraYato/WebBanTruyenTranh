package nlu.com.app.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author VuLuu
 */
@Entity

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "books")
public class Book  {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "book_id")
  private Long bookId;
  @Column(name = "title")
  private String title;
  @Column(name = "publisher")
  private String publisher;
  @Column(name = "publish_year")
  private String publishYear;
  @Column(name = "weight")
  private double weight;
  @Column(name = "product_code")
  private String productCode;
  @Column(name = "supplier")
  private String supplier;
  @Column(name = "author")
  private String author;
  @Column(name = "language")
  private String language;
  @Column(name = "page_count")
  private int pageCount;
  @Column(name = "translator")
  private String translator;
  @Column(name = "size")
  private String size;
  @Column(name = "format")
  private String format;
  @Column(name = "age")
  private String age;
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;
  @Column(name = "qty_in_stock")
  private int qtyInStock;
  @Column(name = "price")
  private Double price;
  @Column(name = "created_at")
  private LocalDateTime createdAt;
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
  @Column(name = "genre", columnDefinition = "TEXT")
  private String genre;
  @Column(name = "wb_point")
  private Double wbPoint;
  @Column(name = "type_purchase")
  private String typePurchase;
  @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<BookImage> images = new ArrayList<>();

  @ManyToOne
  @JoinColumn(name = "category_id")
  private Category category;

//  @ManyToOne
//  @JoinColumn(name = "genre_id")
//  private Genre genre;



}

