package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nlu.com.app.constant.EStockReceipt;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "imported_stock_receipt")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ImportedStockReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String receiptCode;

    private String supplierName;
    private String importerName;

    private Double totalAmount;
    private String note;
    @Enumerated(EnumType.STRING)
    private EStockReceipt status;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImportedStockReceiptDetails> details;
}

