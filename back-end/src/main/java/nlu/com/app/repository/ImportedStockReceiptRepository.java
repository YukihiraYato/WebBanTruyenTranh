package nlu.com.app.repository;

import nlu.com.app.constant.EStockReceipt;
import nlu.com.app.entity.ImportedStockReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportedStockReceiptRepository extends JpaRepository<ImportedStockReceipt, Long> {
    Page<ImportedStockReceipt> findByStatus(EStockReceipt status, Pageable pageable);

    Page<ImportedStockReceipt> findAll(Pageable pageable);

    @Query("SELECT r FROM ImportedStockReceipt r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:keyword IS NULL OR r.receiptCode LIKE %:keyword% OR r.supplierName LIKE %:keyword%)")
    Page<ImportedStockReceipt> searchReceipts(EStockReceipt status, String keyword, Pageable pageable);
}
