package nlu.com.app.service.impl;

import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.response.UserSearchHistoryResponse;
import nlu.com.app.entity.User;
import nlu.com.app.entity.UserSearchHistory;
import nlu.com.app.repository.UserRepository;
import nlu.com.app.repository.UserSearchHistoryRepository;
import nlu.com.app.service.SearchHistoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional
public class SearchHistoryServiceImpl implements SearchHistoryService {
    private final UserSearchHistoryRepository repository;
    private final UserRepository userRepository;
    @Override
    public void saveSearchKeyword(Long userId, String keyword) {
        User user = userRepository.findByUserId(userId).orElseThrow();
        repository.findByUser_UserIdAndKeyword(userId, keyword)
                .ifPresentOrElse(history -> {
                    history.setSearchCount(history.getSearchCount() + 1);
                    history.setSearchedAt(LocalDateTime.now());
                    repository.save(history);
                }, () -> {
                    UserSearchHistory newHistory = new UserSearchHistory();
                    newHistory.setUser(user);
                    newHistory.setKeyword(keyword);
                    newHistory.setSearchCount(1);
                    newHistory.setSearchedAt(LocalDateTime.now());
                    repository.save(newHistory);
                });
    }

    @Override
    public List<UserSearchHistoryResponse> getRecentSearches(Long userId) {
        List<UserSearchHistory> histories = repository.findTop10ByUser_UserIdOrderBySearchedAtDesc(userId);
        return histories.stream()
                .map(history -> UserSearchHistoryResponse.builder()
                        .keyword(history.getKeyword())
                        .searchCount(history.getSearchCount())
                        .build())
                .toList();
    }

    @Override
    public void deleteSearchHistory(Long userId, String keyword) {
            repository.deleteByUser_UserIdAndKeyword(userId, keyword);
    }
}
