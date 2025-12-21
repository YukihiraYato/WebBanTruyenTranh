package nlu.com.app.repository;

import nlu.com.app.entity.Book;
import nlu.com.app.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author VuLuu
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Page<Book> findAllByCategoryIn(Iterable<Category> categories, Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category", "genre"})
    Page<Book> findAllByCategoryIn(List<Category> categories, Pageable pageable);

    @EntityGraph(attributePaths = {"images", "category", "genre"})
    Page<Book> findAllByCategoryInAndPriceBetweenAndTitleContainingIgnoreCase(
            List<Category> categories,
            Double minPrice,
            Double maxPrice,
            String bookName,
            Pageable pageable
    );

    Page<Book> findAllBy(Pageable pageable);

    Optional<Book> findByBookId(Long id);

    List<Book> findTop5ByOrderByBookIdDesc();
}
