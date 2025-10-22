package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "redeem_reward")
@Data
@NoArgsConstructor
@ToString(exclude = "redeemRewardImages")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RedeemReward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reward_id")
    Long rewardId;
    String title;
    String price;
    @Column(columnDefinition = "TEXT")
    String description;
    String supplier;
    String origin;
    String manufactured_in;
    String color;
    String material;
    String size;
    String weight;
    Long qty_in_stock;

    @CreationTimestamp
    @Column(name = "created_date", updatable = false)
    LocalDateTime createdDate;

    @UpdateTimestamp
    @Column(name = "updated_date")
    LocalDateTime updatedDate;

    @OneToMany(mappedBy = "redeemReward", cascade = CascadeType.ALL)
    List<RedeemRewardImages> redeemRewardImages;


}
