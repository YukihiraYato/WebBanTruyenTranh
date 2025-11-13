package nlu.com.app.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.json.RedeemRewardJson;
import nlu.com.app.dto.response.RedeemRewardResponseDTO;
import nlu.com.app.entity.RedeemReward;
import nlu.com.app.entity.RedeemRewardImages;
import nlu.com.app.mapper.RedeemRewardMapper;
import nlu.com.app.repository.RedeemRepository;
import nlu.com.app.service.RedeemRewardService;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RedeemRewardServiceImpl implements RedeemRewardService {
    private final ObjectMapper objectMapper;
    private final RedeemRepository redeemRepository;
    private final RedeemRewardMapper redeemRewardMapper;
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

                    String priceStr = rewardJson.getPrice().toString();
                    priceStr = priceStr.replace(".", "").replace(",", "").trim();
                    Double price = Double.parseDouble(priceStr);

                    redeemReward.setPrice(price);


                    //  Tạo list ảnh mới cho mỗi reward
                    List<RedeemRewardImages> imageList = new ArrayList<>();

                    // Thêm ảnh thường
                    for (String imgUrl : rewardJson.getImages()) {
                        RedeemRewardImages image = new RedeemRewardImages();
                        image.setImages(imgUrl);
                        image.setIsThumbnail(false);
                        imageList.add(image);
                        image.setRedeemReward(redeemReward);
                    }

                    // Thêm thumbnail
                    RedeemRewardImages thumbnail = imageList.get(0);
                    thumbnail.setIsThumbnail(true);

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

    @Override
    public Page<RedeemRewardResponseDTO> getRedeemRewards(int page, int size) {
    try{
        Page<RedeemReward> listRedeemReward = redeemRepository.findAll(PageRequest.of(page, size));
        Page<RedeemRewardResponseDTO> redeemRewardResponseDTOS = listRedeemReward.map(reward ->{
            return redeemRewardMapper.toRedeemRewardResponseDTO(reward);
        });
        return redeemRewardResponseDTOS;
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
    }

    @Override
    public Page<RedeemRewardResponseDTO> getRedeemRewardsByFilter(
            int page,
            int size,
            String material,
            String origin,
            String rangePrice,
            String keyword
    ) {
        try {
            // ✅ 1. Parse khoảng giá
            double minPrice = 0;
            double maxPrice = Double.MAX_VALUE;

            if (rangePrice != null && !rangePrice.isEmpty()) {
                String[] parts = rangePrice.split("-");
                try {
                    if (parts.length > 0 && !parts[0].isEmpty()) {
                        minPrice = Double.parseDouble(parts[0]);
                    }
                    if (parts.length > 1 && !parts[1].isEmpty()) {
                        maxPrice = Double.parseDouble(parts[1]);
                    }
                } catch (NumberFormatException e) {
                    minPrice = 0;
                    maxPrice = Double.MAX_VALUE;
                }
            }

            final double minPriceFinal = minPrice;
            final double maxPriceFinal = maxPrice;

            // ✅ 2. Xây dựng Specification linh hoạt
            Specification<RedeemReward> spec = Specification.where(null);

            if (material != null && !material.isEmpty()) {
                spec = spec.and((root, query, cb) ->
                        cb.like(cb.lower(root.get("material")), "%" + material.toLowerCase() + "%"));
            }

            if (origin != null && !origin.isEmpty()) {
                spec = spec.and((root, query, cb) ->
                        cb.like(cb.lower(root.get("origin")), "%" + origin.toLowerCase() + "%"));
            }

            // ✅ 3. Lọc theo giá
            spec = spec.and((root, query, cb) ->
                    cb.between(root.get("price"), minPriceFinal, maxPriceFinal));

            // ✅ 4. Lọc theo keyword (title)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String kw = "%" + keyword.trim().toLowerCase() + "%";
                spec = spec.and((root, query, cb) ->
                        cb.like(cb.lower(root.get("title")), kw));
            }

            // ✅ 5. Query & paging
            Page<RedeemReward> resultPage = redeemRepository.findAll(spec, PageRequest.of(page, size));

            // ✅ 6. Map sang DTO
            return resultPage.map(redeemRewardMapper::toRedeemRewardResponseDTO);

        } catch (Exception e) {
            throw new RuntimeException("❌ Error while filtering RedeemRewards", e);
        }
    }


    @Override
    public Page<RedeemRewardResponseDTO> searchRedeemRewards(int page, int size, String keyword) {
      Page<RedeemRewardResponseDTO> redeemRewardResponseDTOS = redeemRepository.findByTitleContainingIgnoreCase(keyword, PageRequest.of(page, size)).map(redeemRewardMapper::toRedeemRewardResponseDTO);
        System.out.println("Có ra danh sách redeem reward: "+ redeemRewardResponseDTOS.getContent().size());
      return redeemRewardResponseDTOS;
    }

    @Override
    public Optional<RedeemRewardResponseDTO> getRedeemRewardById(long redeemRewardId) {
        Optional<RedeemReward> redeemReward = redeemRepository.findById(redeemRewardId);
        return redeemReward.map(redeemRewardMapper::toRedeemRewardResponseDTO);
    }


}
