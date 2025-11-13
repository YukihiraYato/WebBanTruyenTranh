package nlu.com.app.mapper;

import nlu.com.app.dto.cart.CartItem;
import nlu.com.app.dto.response.CartItemResponseDTO;
import nlu.com.app.dto.response.RedeemRewardResponseDTO;
import nlu.com.app.entity.RedeemReward;
import nlu.com.app.entity.RedeemRewardImages;
import nlu.com.app.repository.BookRepository;
import nlu.com.app.repository.RedeemRepository;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true))
public interface RedeemRewardMapper {
    RedeemRewardMapper INSTANCE = Mappers.getMapper(RedeemRewardMapper.class);
    @Mappings({
            @Mapping(source = "manufactured_in", target = "manufacturedIn"),
            @Mapping(source = "qty_in_stock", target = "qtyInStock"),
            @Mapping(source = "redeemRewardImages", target = "images", qualifiedByName = "mapImages"),
            @Mapping(source = "typePurchase", target = "typePurchase")
    })
    RedeemRewardResponseDTO toRedeemRewardResponseDTO(RedeemReward redeemReward);

    @Named("mapImages")
    default List<RedeemRewardResponseDTO.RedeemRewardImageResponseDTO> mapImages(List<RedeemRewardImages> redeemRewardImages) {
        List<RedeemRewardResponseDTO.RedeemRewardImageResponseDTO> redeemRewardImageResponseDTOS = new ArrayList<>();
        for (RedeemRewardImages redeemRewardImage : redeemRewardImages) {
            RedeemRewardResponseDTO.RedeemRewardImageResponseDTO redeemRewardImageResponseDTO = RedeemRewardResponseDTO.RedeemRewardImageResponseDTO.builder()
                    .imageUrl(redeemRewardImage.getImages())
                    .isThumbnail(redeemRewardImage.getIsThumbnail())
                    .build();
            redeemRewardImageResponseDTOS.add(redeemRewardImageResponseDTO);
        }
        return redeemRewardImageResponseDTOS;

    }
    @Mapping(target = "productId", expression = "java(parseProductId(cartItem.getProductId()))")
    @Mapping(target = "title", source = "cartItem", qualifiedByName = "mapTitle")
    @Mapping(target = "price", source = "cartItem", qualifiedByName = "mapPrice")
    @Mapping(target = "imageUrl", source = "cartItem", qualifiedByName = "mapImageUrlJustOnce")
    @Mapping(target = "quantity", source = "cartItem.quantity")
    CartItemResponseDTO.RewardItemResponseDTO toRewardItemResponseDTO(
            CartItem cartItem,
            @Context RedeemRepository redeemRepository
    );

    default Long parseProductId(String productId) {
        try {
            return Long.parseLong(productId);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Named("mapTitle")
    default String mapTitle(CartItem cartItem, @Context RedeemRepository redeemRepository) {
        RedeemReward redeemReward = getRedeemRewardFromCartItem(cartItem, redeemRepository);
        return redeemReward != null ? redeemReward.getTitle() : null;
    }

    @Named("mapPrice")
    default double mapPrice(CartItem cartItem, @Context RedeemRepository redeemRepository) {
        RedeemReward redeemReward = getRedeemRewardFromCartItem(cartItem, redeemRepository);
        return redeemReward != null ? redeemReward.getPrice() : 0.0;
    }

    @Named("mapImageUrlJustOnce")
    default String mapImageUrlJustOnce(CartItem cartItem, @Context RedeemRepository redeemRepository) {
        RedeemReward redeemReward = getRedeemRewardFromCartItem(cartItem, redeemRepository);
        if (redeemReward == null || redeemReward.getRedeemRewardImages().isEmpty()) return null;
        return redeemReward.getRedeemRewardImages().get(0).getImages();
    }

    default RedeemReward getRedeemRewardFromCartItem(CartItem cartItem, RedeemRepository redeemRepository) {
        try {
            long redeemRewardId = Long.parseLong(cartItem.getProductId());
            return redeemRepository.findByRewardId(redeemRewardId).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }


}
