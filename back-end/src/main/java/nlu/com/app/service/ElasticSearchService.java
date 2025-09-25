package nlu.com.app.service;

import nlu.com.app.dto.response.IntentResponseDTO;

public interface ElasticSearchService {
     Object search(IntentResponseDTO intentResponse);
}
