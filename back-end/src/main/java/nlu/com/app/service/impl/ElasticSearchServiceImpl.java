package nlu.com.app.service.impl;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.response.IntentResponseDTO;
import nlu.com.app.service.ElasticSearchService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ElasticSearchServiceImpl implements ElasticSearchService {
    private final ElasticsearchClient elasticsearchClient;
    @Override
    public Object search(IntentResponseDTO intentResponse) {
        List<Object> results = new ArrayList<>();
        if (intentResponse != null && intentResponse.getIntents().size() > 0) {
            for (Map<String, List<Map<String, Object>>> intent : intentResponse.getIntents()) {
                for (Map.Entry<String, List<Map<String, Object>>> entry : intent.entrySet()) {
                    String indexName = entry.getKey();
                    List<Map<String, Object>> fields = entry.getValue();

                    // Xây dựng danh sách query trước
                    List<Query> mustQueries = new ArrayList<>();
                    for (Map<String, Object> field : fields) {
                        for (Map.Entry<String, Object> f : field.entrySet()) {
                            Object value = f.getValue();
                            if (value == null) continue;

                            if (value instanceof Number || value instanceof Boolean) {
                                mustQueries.add(Query.of(q -> q
                                        .term(t -> t.field(f.getKey()).value(value.toString()))
                                ));
                            } else {
                                mustQueries.add(Query.of(q -> q
                                        .match(m -> m.field(f.getKey()).query(value.toString()))
                                ));
                            }
                        }
                    }

                    if (mustQueries.isEmpty()) continue;

                    // Build BoolQuery 1 lần duy nhất
                    BoolQuery boolQuery = new BoolQuery.Builder()
                            .must(mustQueries)
                            .build();

                    try {
                        SearchResponse<Map> response = elasticsearchClient.search(s -> s
                                        .index(indexName)
                                        .query(q -> q.bool(boolQuery)),
                                Map.class);

                        results.add(response.hits().hits()
                                .stream()
                                .map(h -> h.source())
                                .collect(Collectors.toList()));

                    } catch (IOException e) {
                        throw new RuntimeException("Elasticsearch query failed for index: " + indexName, e);
                    }
                }
            }

            // Debug
            try {
                System.out.println("------------------------------------------");
                System.out.println(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(results));
                System.out.println("------------------------------------------");
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }

            return results;
        }
        return null;
    }

}
