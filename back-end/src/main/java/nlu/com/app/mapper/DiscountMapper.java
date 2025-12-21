package nlu.com.app.mapper;

import nlu.com.app.constant.EDiscountTarget;
import nlu.com.app.constant.EDiscountType;
import nlu.com.app.constant.EUserRank;
import nlu.com.app.dto.request.CreateDiscountRequestDTO;
import nlu.com.app.dto.response.DiscountResponseDTO;
import nlu.com.app.entity.*;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        builder = @Builder(disableBuilder = true))
public interface DiscountMapper {
    @Mapping(target = "code", source = "requestDTO.code")
    @Mapping(target = "title", source = "requestDTO.title")
    @Mapping(target = "startDate", source = "requestDTO.startDate")
    @Mapping(target = "endDate", source = "requestDTO.endDate")
    @Mapping(target = "description", source = "requestDTO.description")
    @Mapping(target = "discountType", source = "requestDTO.discountType", qualifiedByName = "mapDiscountType")
    @Mapping(target = "targetType", source = "requestDTO.targetType", qualifiedByName = "mapDiscountTargetType")
    @Mapping(target = "value", source = "requestDTO.value")
    @Mapping(target = "minOrderAmount", source = "requestDTO.minOrderAmount")
    @Mapping(target = "usageLimit", source = "requestDTO.usageLimit")
    @Mapping(target = "useCount", source = "requestDTO.useCount")
    @Mapping(target = "isActive", source = "requestDTO.isActive")
    @Mapping(target = "rankForVipCustomer", source = "requestDTO.userRank", qualifiedByName = "mapUserRank")
    @Mapping(target = "usageLimitPerUser", source = "requestDTO.usageLimitPerUser")
    @Mapping(target = "pointCost", source = "requestDTO.pointCost")
    Discount mapToDiscount(CreateDiscountRequestDTO requestDTO);

    @Named("mapDiscountType")
    default EDiscountType mapDiscountType(String discountType) {
        return EDiscountType.valueOf(discountType);
    }

    @Named("mapDiscountTargetType")
    default EDiscountTarget mapDiscountTargetType(CreateDiscountRequestDTO.TargetType discountType) {
        return EDiscountTarget.valueOf(discountType.getTargetType());
    }

    @Named("mapUserRank")
    default EUserRank mapUserRank(String userRank) {
        if (userRank == null || userRank.isEmpty()) {
            return null;
        }
        return EUserRank.valueOf(userRank);
    }
//    @Named("mapToLocalDate")
//    default LocalDate mapToLocalDate(String date){
//        return LocalDate.parse(date, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
//    }


    @Mapping(target = "code", source = "discount.code")
    @Mapping(target = "discountId", source = "discount.discountId")
    @Mapping(target = "title", source = "discount.title")
    @Mapping(target = "startDate", source = "discount.startDate", qualifiedByName = "fromDateToString")
    @Mapping(target = "endDate", source = "discount.endDate", qualifiedByName = "fromDateToString")
    @Mapping(target = "description", source = "discount.description")
    @Mapping(target = "discountType", source = "discount.discountType", qualifiedByName = "mapDiscountTypeToString")
    @Mapping(target = "targetType", source = "discount", qualifiedByName = "mapDiscountTargetTypeToObject")
    @Mapping(target = "value", source = "discount.value")
    @Mapping(target = "minOrderAmount", source = "discount.minOrderAmount")
    @Mapping(target = "usageLimit", source = "discount.usageLimit")
    @Mapping(target = "useCount", source = "discount.useCount")
    @Mapping(target = "isActive", source = "discount.isActive")
    @Mapping(target = "booksId", source = "discount.discountBooks", qualifiedByName = "convertToBookId")
    @Mapping(target = "usageLimitPerUser", source = "discount.usageLimitPerUser")
    @Mapping(target = "rankForVipCustomer", source = "discount.rankForVipCustomer", qualifiedByName = "mapUserRankToDTO")
    @Mapping(target = "pointCost", source = "discount.pointCost")
    DiscountResponseDTO mapToDiscountResponseDTO(Discount discount);

    default Page<DiscountResponseDTO> maptoPageDTO(Page<Discount> discountPage) {
        return discountPage.map(this::mapToDiscountResponseDTO);
    }

    default List<DiscountResponseDTO> mapToListDTO(List<Discount> discounts) {
        return discounts.stream().map(this::mapToDiscountResponseDTO).collect(Collectors.toList());
    }

    @Named("fromDateToString")
    default String fromDateToString(LocalDate date) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        return date.format(formatter);
    }

    @Named("mapDiscountTypeToString")
    default String mapDiscountTypeToString(EDiscountType discountType) {
        return discountType.toString();
    }

    @Named("mapDiscountTargetTypeToObject")
    default DiscountResponseDTO.TargetType mapDiscountTargetTypeToObject(Discount discount) {
        if (discount.getTargetType().equals(EDiscountTarget.BOOK)) {
            List<DiscountCategories> discountCategories = discount.getDiscountCategories();
            List<Long> categoryIds = discountCategories.stream().map(DiscountCategories::getCategory).map(Category::getCategoryId).collect(Collectors.toList());
            DiscountResponseDTO.TargetType targetType = DiscountResponseDTO.TargetType.builder().categoryIds(categoryIds).targetType(discount.getTargetType().toString()).build();
            return targetType;
        } else {
            return DiscountResponseDTO.TargetType.builder().targetType(discount.getTargetType().toString()).build();
        }
    }

    @Named("convertToBookId")
    default List<Long> convertToBookId(List<DiscountBooks> discountBooks) {
        return discountBooks.stream().map(DiscountBooks::getBook).map(Book::getBookId).collect(Collectors.toList());
    }

    @Named("mapUserRankToDTO")
    default String mapUserRankToDTO(EUserRank userRank) {
        if (userRank != null) {
            return userRank.toString();
        }
        return null;

    }

}
