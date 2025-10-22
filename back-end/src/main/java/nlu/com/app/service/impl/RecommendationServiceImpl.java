package nlu.com.app.service.impl;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.response.PageBookResponseDTO;
import nlu.com.app.dto.response.RecommendationDTO;
import nlu.com.app.entity.Book;
import nlu.com.app.mapper.BookMapper;
import nlu.com.app.repository.BookRepository;
import nlu.com.app.service.RecommendationService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {
    private  RestTemplate restTemplate = new RestTemplate();
    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    private String url = "http://localhost:8000/recommend/" ;
    final PromotionService promotionService;
    final UserReviewService userReviewService;
    @Override
    public List<RecommendationDTO> getAllRecommendations() throws IOException {
            return null;
    }

    @Override
    public RecommendationDTO getRecommendationsForUser(Long userId, int recommendBook) throws IOException {
        ResponseEntity<RecommendationDTO> response =
                restTemplate.getForEntity(url+userId+"?k="+recommendBook, RecommendationDTO.class);

        RecommendationDTO dto = response.getBody();
        return dto;
    }

    @Override
    public List<PageBookResponseDTO> getBookFromRecommendationId(List<Long> bookId) {
        List<PageBookResponseDTO> books = new ArrayList<>();
        for(Long id : bookId){
            Book book = bookRepository.findById(id).get();
            double totalDiscounts = promotionService.getPromotionsAppliedForCategory(book.getCategory().getCategoryId())
                    .stream().map(promotion -> promotion.getDiscountPercentage())
                    .reduce((prev, cur) -> prev + cur)
                    .orElse(0f);
            double rating = userReviewService.getReviewOverall(book.getBookId()).getAvgScore();
            PageBookResponseDTO dto = bookMapper.toPageDto(book, totalDiscounts, rating);
            books.add(dto);
        }
        return books;
    }
}
