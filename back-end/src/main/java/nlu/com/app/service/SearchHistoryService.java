package nlu.com.app.service;

import nlu.com.app.dto.response.UserSearchHistoryResponse;
import nlu.com.app.entity.UserSearchHistory;
import java.util.List;
public interface SearchHistoryService {
    public void saveSearchKeyword(Long userId, String keyword);
    public List<UserSearchHistoryResponse> getRecentSearches(Long userId);
    public void deleteSearchHistory(Long userId, String keyword);
}
