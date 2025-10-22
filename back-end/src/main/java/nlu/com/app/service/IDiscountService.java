package nlu.com.app.service;

import nlu.com.app.dto.response.DiscountResponseDTO;
import nlu.com.app.entity.Discount;
import org.springframework.data.domain.Page;
import java.util.List;
public interface IDiscountService {
    Discount createDiscount(Discount discount);
    Page<DiscountResponseDTO> getDiscounts(int page, int size);
    Discount updateDiscount(Discount discount);
    boolean deleteDiscount(Discount discount);
    Discount getDetailDiscount(Long id);
    List<DiscountResponseDTO> getDiscountsByUserId(Long userId);
}
