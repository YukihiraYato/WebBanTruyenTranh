package nlu.com.app.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.json.RedeemRewardJson;
import nlu.com.app.entity.RedeemReward;
import nlu.com.app.entity.RedeemRewardImages;
import nlu.com.app.repository.RedeemRepository;
import nlu.com.app.service.RedeemRewardService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
@Service
@Transactional
@RequiredArgsConstructor
public class RedeemRewardServiceImpl implements RedeemRewardService {
    private final ObjectMapper objectMapper;
    private final RedeemRepository redeemRepository;
    @Override
    public void initData() {

        ClassPathResource resource = new ClassPathResource("RedeemReward.json");

        try {
            if (redeemRepository.findAllBy().isEmpty()) {
                List<RedeemRewardJson> rewardJsonList = objectMapper.readValue(
                        resource.getInputStream(),
                        new TypeReference<List<RedeemRewardJson>>() {}
                );


                rewardJsonList.forEach(rewardJson -> {
                    RedeemReward redeemReward = redeemRepository.findByRewardId(rewardJson.getReward_id()).orElseGet(RedeemReward::new);
//                    redeemReward.setRewardId(rewardJson.getReward_id());
                    redeemReward.setTitle(rewardJson.getTitle());
                    redeemReward.setDescription(rewardJson.getDescription());
                    redeemReward.setSupplier(rewardJson.getSupplier());
                    redeemReward.setOrigin(rewardJson.getOrigin());
                    redeemReward.setManufactured_in(rewardJson.getManufactured_in());
                    redeemReward.setColor(rewardJson.getColor());
                    redeemReward.setMaterial(rewardJson.getMaterial());
                    redeemReward.setSize(rewardJson.getSize());
                    redeemReward.setWeight(rewardJson.getWeight());
                    redeemReward.setQty_in_stock(rewardJson.getQty_in_stock());
                    redeemReward.setPrice(rewardJson.getPrice());


                    //  Tạo list ảnh mới cho mỗi reward
                    List<RedeemRewardImages> imageList = new ArrayList<>();

                    // Thêm ảnh thường
                    for (String imgUrl : rewardJson.getImages()) {
                        RedeemRewardImages image = new RedeemRewardImages();
                        image.setImages(imgUrl);
                        image.setIsThumbnail(false);
                        imageList.add(image);
                    }

                    // Thêm thumbnail
                    RedeemRewardImages thumb = new RedeemRewardImages();
                    thumb.setImages(rewardJson.getUrl());
                    thumb.setIsThumbnail(true);
                    imageList.add(thumb);

                    // Gán danh sách ảnh vào reward
                    redeemReward.setRedeemRewardImages(imageList);

                    //  Lưu toàn bộ (cascade sẽ tự lưu imageList)
                    redeemRepository.save(redeemReward);
                });

                System.out.println("INIT DATA REDEEM REWARD SUCCESS");
            }

        } catch (IOException e) {
            throw new RuntimeException("❌ Failed to read RedeemReward.json", e);
        }
    }

}
