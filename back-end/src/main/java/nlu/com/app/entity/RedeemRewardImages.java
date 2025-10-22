package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "redeem_reward_images")
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@ToString(exclude = "reward")
public class RedeemRewardImages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "redeem_reward_image_id")
    Long redeemRewardImageId;
    String images;
    Boolean isThumbnail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="reward_id")
    RedeemReward redeemReward;
}
