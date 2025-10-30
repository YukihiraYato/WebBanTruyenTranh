package nlu.com.app.mapper;

import nlu.com.app.constant.EDiscountTarget;
import nlu.com.app.constant.EDiscountType;
import nlu.com.app.dto.request.CreateDiscountRequestDTO;
import nlu.com.app.dto.response.DiscountResponseDTO;
import nlu.com.app.entity.Book;
import nlu.com.app.entity.Discount;
import nlu.com.app.entity.DiscountBooks;
import org.mapstruct.*;
import org.springframework.boot.autoconfigure.web.format.DateTimeFormatters;
import org.springframework.data.domain.Page;

import java.text.SimpleDateFormat;
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
    @Mapping(target = "endDate", source = "requestDTO.endDate" )
    @Mapping(target = "description", source = "requestDTO.description")
    @Mapping(target = "discountType", source = "requestDTO.discountType", qualifiedByName = "mapDiscountType")
    @Mapping(target = "targetType", source = "requestDTO.targetType", qualifiedByName = "mapDiscountTargetType")
    @Mapping(target = "value", source = "requestDTO.value")
    @Mapping(target = "minOrderAmount", source = "requestDTO.minOrderAmount")
    @Mapping(target = "usageLimit", source = "requestDTO.usageLimit")
    @Mapping(target = "useCount", source = "requestDTO.useCount")
    @Mapping(target = "isActive", source = "requestDTO.isActive")
    Discount mapToDiscount(CreateDiscountRequestDTO requestDTO);
    @Named("mapDiscountType")
    default EDiscountType mapDiscountType(String discountType){
        return  EDiscountType.valueOf(discountType);
    }
    @Named("mapDiscountTargetType")
    default EDiscountTarget mapDiscountTargetType(String discountType){
        return EDiscountTarget.valueOf(discountType);
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
    @Mapping(target = "targetType", source = "discount.targetType", qualifiedByName = "mapDiscountTargetTypeToString")
    @Mapping(target = "value", source = "discount.value")
    @Mapping(target = "minOrderAmount", source = "discount.minOrderAmount")
    @Mapping(target = "usageLimit", source = "discount.usageLimit")
    @Mapping(target = "useCount", source = "discount.useCount")
    @Mapping(target = "isActive", source = "discount.isActive")
    @Mapping(target = "booksId", source = "discount.discountBooks", qualifiedByName = "convertToBookId")
    DiscountResponseDTO mapToDiscountResponseDTO(Discount discount);
    default Page<DiscountResponseDTO> maptoPageDTO(Page<Discount> discountPage){
        return discountPage.map(this :: mapToDiscountResponseDTO);
    }
    default List<DiscountResponseDTO> mapToListDTO(List<Discount> discounts){
        return discounts.stream().map(this :: mapToDiscountResponseDTO).collect(Collectors.toList());
    }
    @Named("fromDateToString")
    default String fromDateToString(LocalDate date){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        return date.format(formatter);
    }
    @Named("mapDiscountTypeToString")
    default String mapDiscountTypeToString(EDiscountType discountType){
        return discountType.toString();
    }
    @Named("mapDiscountTargetTypeToString")
    default String mapDiscountTargetTypeToString(EDiscountTarget discountType){
        return discountType.toString();
    }
    @Named("convertToBookId")
    default List<Long> convertToBookId(List<DiscountBooks> discountBooks){
        return discountBooks.stream().map(DiscountBooks::getBook).map(Book::getBookId).collect(Collectors.toList());
    }

}
