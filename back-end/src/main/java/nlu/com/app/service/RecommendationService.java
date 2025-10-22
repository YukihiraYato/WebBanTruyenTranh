package nlu.com.app.service;

import nlu.com.app.dto.response.PageBookResponseDTO;
import nlu.com.app.dto.response.RecommendationDTO;
import java.util.List;
import java.io.IOException;

public interface RecommendationService {
    public List<RecommendationDTO> getAllRecommendations() throws IOException;
    public RecommendationDTO getRecommendationsForUser(Long userId,int recommendBook) throws IOException;
    public List<PageBookResponseDTO> getBookFromRecommendationId(List<Long> bookId);
}
