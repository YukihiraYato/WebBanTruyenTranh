package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nlu.com.app.constant.EProductType;

@Entity
@Table(name = "imported_stock_receipt_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportedStockReceiptDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "receipt_id")
    private ImportedStockReceipt receipt;

    @Enumerated(EnumType.STRING)
    private EProductType productType;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne
    @JoinColumn(name = "reward_id")
    private RedeemReward reward;

    private int quantity;
    private Double importPrice;
}
