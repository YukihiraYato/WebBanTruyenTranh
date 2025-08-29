package nlu.com.app.repository;

import java.util.Collection;
import java.util.List;
import nlu.com.app.entity.Category;
import nlu.com.app.entity.Promotion;
import nlu.com.app.entity.PromotionCategories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author VuLuu
 */
@Repository
@Transactional
public interface PromotionCategoriesRepository extends JpaRepository<PromotionCategories, Long> {
  List<PromotionCategories> findByCategory_CategoryIdIn(Collection<Long> categoryIds);
  List<PromotionCategories> findByCategory(Category category);

  @Query("""
      SELECT p FROM Promotion p
      JOIN PromotionCategories pc ON pc.promotion = p
      WHERE pc.category.categoryId IN :categoryIds
      AND CURRENT_DATE BETWEEN p.startDate AND p.endDate
      """)
  List<Promotion> findActivePromotionsByCategoryIds(@Param("categoryIds") List<Long> categoryIds);
  @Modifying
  @Query(value = """
      UPDATE promotion_categories pc
      SET pc.category_id = :categoryId
      WHERE pc.promotion_id = :promotionId
      """, nativeQuery = true)
  int updatePromotionCategories(@Param("promotionId") Long promotionId, @Param("categoryId") Long categoryId);

}

