package nlu.com.app.repository;

import java.util.List;
import nlu.com.app.entity.BookCollectionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author VuLuu
 */
@Repository
public interface BookCollectionItemRepository extends JpaRepository<BookCollectionItem, Long> {
//Trường hợp nếu tên biến ko chứa id thì đặt phương thức có field._nestedField
  List<BookCollectionItem> findAllByCollection_CollectionId(Long collectionId);
  void deleteByCollection_CollectionIdAndBook_BookId(Long collectionId, Long bookId);
}
