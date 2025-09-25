package nlu.com.app.service;

import nlu.com.app.dto.response.IntentResponseDTO;

public interface IChatService {
     String reply(Long userId);
     IntentResponseDTO detectIntent(Long userId);
}
