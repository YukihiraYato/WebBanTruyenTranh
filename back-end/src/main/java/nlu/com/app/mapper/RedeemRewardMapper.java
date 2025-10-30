package nlu.com.app.mapper;

import nlu.com.app.dto.response.RedeemRewardResponseDTO;
import nlu.com.app.entity.RedeemReward;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true))
public interface RedeemRewardMapper {
    RedeemRewardMapper INSTANCE = Mappers.getMapper(RedeemRewardMapper.class);
    @Mappings({
            @Mapping(source = "manufactured_in", target = "manufacturedIn"),
            @Mapping(source = "qty_in_stock", target = "qtyInStock")
    })
    RedeemRewardResponseDTO toRedeemRewardResponseDTO(RedeemReward redeemReward);

}
