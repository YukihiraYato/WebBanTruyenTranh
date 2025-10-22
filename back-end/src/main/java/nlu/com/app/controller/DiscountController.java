package nlu.com.app.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import nlu.com.app.constant.EDiscountTarget;
import nlu.com.app.constant.EDiscountType;
import nlu.com.app.dto.AppResponse;
import nlu.com.app.dto.request.CreateDiscountRequestDTO;
import nlu.com.app.dto.request.UpdateDiscountRequestDTO;
import nlu.com.app.dto.response.DiscountResponseDTO;
import nlu.com.app.entity.Discount;
import nlu.com.app.mapper.DiscountMapper;
import nlu.com.app.repository.DiscountRepository;
import nlu.com.app.service.IDiscountService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/discount")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DiscountController {
    IDiscountService discountService;
    DiscountMapper  discountMapper;
    private final DiscountRepository discountRepository;

    @PostMapping("/create")
    public AppResponse<String> createNewDiscount(@RequestBody CreateDiscountRequestDTO request) {
        Discount discount = discountMapper.mapToDiscount(request);
        try{
            discountService.createDiscount(discount);
            return AppResponse.<String>builder().result("Create discount successfully").build();
        }catch (Exception e){
            e.printStackTrace();
            return AppResponse.<String>builder().code(9999).result("Create discount failed").build();
        }
    }
    @GetMapping
    public AppResponse<Page<DiscountResponseDTO>> getAllDiscounts(
            @RequestParam(defaultValue = "0", required = false) int page,
            @RequestParam(defaultValue = "10", required = false) int size) {
       try{
           Page<DiscountResponseDTO> discounts = discountService.getDiscounts(page, size);
           return AppResponse.<Page<DiscountResponseDTO>>builder().result(discounts).build();
       } catch (Exception e) {
           throw new RuntimeException(e);
       }
    }
    @GetMapping("/user/{userId}")
    public AppResponse<List<DiscountResponseDTO>> getAllDiscountsByUserId(@PathVariable Long userId) {
        try{
            List<DiscountResponseDTO> discounts = discountService.getDiscountsByUserId(userId);
            return AppResponse.<List<DiscountResponseDTO>>builder().result(discounts).build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @GetMapping("/detail/{id}")
    public AppResponse<DiscountResponseDTO> getDetailDiscount(@PathVariable Long id) {
        try{
            Discount discount = discountService.getDetailDiscount(id);
           
            if(discount == null){
                return AppResponse.<DiscountResponseDTO>builder().code(9999).result(null).message("Discount not found").build();
            }
            DiscountResponseDTO discountResponseDTO = discountMapper.mapToDiscountResponseDTO(discount);
            return AppResponse.<DiscountResponseDTO>builder().result(discountResponseDTO).build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @PutMapping("/update")
    public AppResponse<String> updateDiscount(@RequestBody UpdateDiscountRequestDTO request) {
        Discount discount = discountRepository.findById(request.getId()).orElse(null);
        discount.setCode(request.getCode());
        discount.setTitle(request.getTitle());
        discount.setDescription(request.getDescription());
        discount.setDiscountType(EDiscountType.valueOf(request.getDiscountType()));
        discount.setValue(request.getValue());
        discount.setTargetType(EDiscountTarget.valueOf(request.getTargetType()));
        discount.setMinOrderAmount(request.getMinOrderAmount());
        discount.setUsageLimit(request.getUsageLimit());
        discount.setUseCount(request.getUseCount());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount.setIsActive(request.getIsActive());
        try{
            discountService.updateDiscount(discount);
            return AppResponse.<String>builder().result("Update discount successfully").build();
        }catch (Exception e){
            e.printStackTrace();
            return AppResponse.<String>builder().code(9999).result("Update discount failed").build();
        }
    }
}
