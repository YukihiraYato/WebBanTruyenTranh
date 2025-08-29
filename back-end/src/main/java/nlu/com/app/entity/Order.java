package nlu.com.app.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nlu.com.app.constant.EOrderStatus;

/**
 * @author VuLuu
 */
@Entity
@Table(name = "orders")
@NoArgsConstructor
@Data
@AllArgsConstructor
@Builder
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "order_id")
  private Long orderId;
  @Column(name = "pending_confirmation_date")
  private LocalDateTime pendingConfirmationDate;
  @Column(name = "confirmed_date")
  private LocalDateTime confirmedDate;
  @Column(name = "shipping_date")
  private LocalDateTime shippingDate;
  @Column(name = "delivered_date")
  private LocalDateTime deliveredDate;
  @Column(name = "cancelled_date")
  private LocalDateTime cancelledDate;
  @Enumerated(EnumType.STRING)
  @Column(name = "status")
  private EOrderStatus status;
  @Column(name = "total_amount")
  private double totalAmount;
  @Column(name = "note")
  private  String note;
  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> orderItems = new ArrayList<>();

  @ManyToOne
  @JoinColumn(name = "address_id")
  private Address address;
  @ManyToOne
  @JoinColumn(name = "payment_method_id")
  private PaymentMethod paymentMethod;
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<DiscountOrders> discountOrders;


}
