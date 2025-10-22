package nlu.com.app.service.impl;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.response.DiscountResponseDTO;
import nlu.com.app.entity.Discount;
import nlu.com.app.mapper.DiscountMapper;
import nlu.com.app.repository.DiscountRepository;
import nlu.com.app.service.IDiscountService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@Transactional
@RequiredArgsConstructor
public class DiscountServiceImpl implements IDiscountService {
    private final DiscountRepository discountRepository;
    private final DiscountMapper discountMapper;
    @Override
    public Discount createDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    @Override
    public Page<DiscountResponseDTO> getDiscounts(int page, int size) {
        Page<Discount> listDiscount = discountRepository.findAll(PageRequest.of(page, size));
        Page<DiscountResponseDTO> discountResponseDTOS = discountMapper.maptoPageDTO(listDiscount);
        return discountResponseDTOS;
    }

    @Override
    public Discount updateDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    @Override
    public boolean deleteDiscount(Discount discount) {
        try{
            discountRepository.delete(discount);
            return true;
        }catch (Exception e){
            return false;
        }
    }

    @Override
    public Discount getDetailDiscount(Long id) {
       try{
           return discountRepository.findById(id).get();
       }catch (Exception e){
           return null;
       }
    }

    @Override
    public List<DiscountResponseDTO> getDiscountsByUserId(Long userId) {
        List<Discount> discountList = discountRepository.findAvailableDiscountsForUser(userId);
        List<DiscountResponseDTO> discountResponseDTOS = discountMapper.mapToListDTO(discountList);
        return discountResponseDTOS;

    }
}
