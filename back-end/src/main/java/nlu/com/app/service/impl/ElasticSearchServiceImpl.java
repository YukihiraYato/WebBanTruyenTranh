package nlu.com.app.service.impl;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.response.IntentResponseDTO;
import nlu.com.app.service.ElasticSearchService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ElasticSearchServiceImpl implements ElasticSearchService {
    private final ElasticsearchClient elasticsearchClient;

    @Override
    public Object search(IntentResponseDTO intentResponse) {
        List<Object> results = new ArrayList<>();

        if (intentResponse == null || intentResponse.getIntents().isEmpty()) {
            return null;
        }

        for (Map<String, List<Map<String, Object>>> intent : intentResponse.getIntents()) {
            for (Map.Entry<String, List<Map<String, Object>>> entry : intent.entrySet()) {

                String indexName = entry.getKey();
                List<Map<String, Object>> fields = entry.getValue();

                // =========================
                // 1. ƯU TIÊN TITLE
                // =========================
                String title = extractStringField(fields, "title");
                if ("books".equals(indexName) && title != null) {
                    List<Map> books = null;
                    try {
                        books = searchBookByTitle(indexName, title);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                    if (!books.isEmpty()) {
                        results.add(books);
                        continue;
                    }
                }

                // =========================
                // 2. FALLBACK: field khác
                // =========================
                List<Query> mustQueries = new ArrayList<>();

                for (Map<String, Object> field : fields) {
                    for (Map.Entry<String, Object> f : field.entrySet()) {
                        Object value = f.getValue();
                        if (value == null || "title".equals(f.getKey())) continue;

                        mustQueries.add(Query.of(q ->
                                q.match(m -> m.field(f.getKey()).query(value.toString()))
                        ));
                    }
                }

                if (mustQueries.isEmpty()) continue;

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
                    throw new RuntimeException(e);
                }
            }
        }
        System.out.println("Object của elasticsearch: " + results);
        return results.isEmpty() ? null : results;
    }

    private String extractStringField(List<Map<String, Object>> fields, String key) {
        for (Map<String, Object> field : fields) {
            if (field.containsKey(key) && field.get(key) != null) {
                return field.get(key).toString();
            }
        }
        return null;
    }

    private List<Map> searchBookByTitle(String index, String title) throws IOException {
        // 1. match_phrase (chính xác)
        SearchResponse<Map> phrase = elasticsearchClient.search(s -> s
                        .index(index)
                        .query(q -> q.matchPhrase(m -> m.field("title").query(title)))
                        .size(5),
                Map.class);

        if (!phrase.hits().hits().isEmpty()) {
            return phrase.hits().hits().stream().map(h -> h.source()).toList();
        }

        // 2. match (nới lỏng)
        SearchResponse<Map> match = elasticsearchClient.search(s -> s
                        .index(index)
                        .query(q -> q.match(m -> m.field("title").query(title)))
                        .size(5),
                Map.class);

        return match.hits().hits().stream().map(h -> h.source()).toList();
    }

}
