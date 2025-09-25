package nlu.com.app.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import nlu.com.app.dto.response.IntentResponseDTO;
import nlu.com.app.service.ElasticSearchService;
import nlu.com.app.service.IChatService;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements IChatService {

    private final OpenAiChatModel openAiChatModel;
    private final ElasticSearchService elasticSearchService;
    private final ObjectMapper objectMapper;
    private final StringRedisTemplate redisTemplate;
    private static final String CHAT_KEY_PREFIX = "chat:history:";
    @Override
    public String reply(Long userId) {
        IntentResponseDTO intentResponseDTO = detectIntent(userId);
        System.out.println("--------------------------Value của intentResponseDTO--------------------------: " + intentResponseDTO);
        List<String> userMessage = redisTemplate.opsForList().range(CHAT_KEY_PREFIX + userId, 0, 1);
        String message = String.join("\n", userMessage);
        Prompt prompt = new Prompt(message, OpenAiChatOptions.builder().model(OpenAiApi.ChatModel.GPT_4_O_MINI).build());
        if(intentResponseDTO == null){

            ChatResponse chatResponse = openAiChatModel.call(prompt);
            return chatResponse.getResult().getOutput().getText();
        }
        Object object = elasticSearchService.search(intentResponseDTO);

        try {
            String formatted = """
                    Người dùng hỏi: "%s"
                    Dữ liệu tìm thấy từ hệ thống:
                    %s
                    
                    Hãy trả lời người dùng bằng phong cách tự nhiên, dễ hiểu.
                    Nếu data được cung cấp bị null hoặc rỗng, hãy thông báo người dùng dữ liệu mà người dùng tìm không có trong hệ thống 1 các tự nhiên, dễ hiểu.
                    """.formatted(message, objectMapper.writeValueAsString(object));
            ChatResponse chatResponse2 = openAiChatModel.call(new Prompt(formatted, OpenAiChatOptions.builder().model(OpenAiApi.ChatModel.GPT_4_O_MINI).build()));
            return chatResponse2.getResult().getOutput().getText();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

    }

    @Override
    public IntentResponseDTO detectIntent(Long userId) {
        List<String> userMessage = redisTemplate.opsForList().range(CHAT_KEY_PREFIX + userId, 0, 1);
        String message = String.join("\n", userMessage);
        String prompt = """
Bạn là hệ thống phân tích intent cho chatbot bán sách.
Nhiệm vụ: dựa vào câu hỏi của user, hãy phát hiện intent (tên index trong Elasticsearch) 
và liệt kê các fields liên quan.

### Yêu cầu output JSON:
{
"intents": [
  {
    "<tên_index_elasticsearch>": [
      { "<tên_trường1>": "giá trị1" },
      { "<tên_trường2>": "giá trị2" }
    ]
  },
  {
    "<tên_index_elasticsearch2>": [
      { "<tên_trường1>": "giá trị1" }
    ]
  }
]
}

### Các intent (index) hợp lệ và field tương ứng:

- "books":
  - title (string)
  - author (string)
  - translator (string)
  - format (string)
  - language (string)
  - page_count (number)
  - genre_name (string)
  - price (number)
  - publisher (string)
  - supplier (string)
  - publish_year (number)
  - size (string)
  - weight (number)
  - age (number)
  - category_name (string)
  - book_id (string)

- "book_images":
  - book_id (string)
  - image_url (string)
  - is_thumbnail (boolean)

- "categories":
  - category_id (string)
  - category_name (string)
  - parent_category_id (string)

- "discounts":
  - code (string)
  - title (string)
  - discount_id (string)
  - is_active (boolean)
  - start_date (date)
  - end_date (date)

- "genres":
  - genre_id (string)
  - name (string)

- "order_items":
  - order_item_id (string)
  - order_id (string)
  - book_id (string)
  - quantity (number)
  - price (number)
  - status (string)

- "payment_methods":
  - payment_method_id (string)
  - method_name (string)

- "promotions":
  - promotion_id (string)
  - promotion_name (string)
  - start_date (date)
  - end_date (date)
  - discount_percentage (number)

- "user_reviews":
  - review_id (string)
  - book_id (string)
  - user_id (string)
  - rating (number)
  - review_text (string)
  - review_date (date)

### Lưu ý:
1. Intent phải là một trong các index trên.
2. Fields phải thuộc index tương ứng.
3. Chỉ trả về JSON thuần, không giải thích thêm.
4. Nếu các fields của 1 intent không tìm thấy value trong message user thì hãy gán giá trị null. 
5. "Chỉ trả về JSON thuần, không thêm bất cứ ký tự nào khác, trừ trường hợp nếu trong message user không tìm thấy bất kì intent nào thì trả thẳng null"
6.  Nếu tin nhắn mới nhất của User nói cảm ơn, khen ngợi, chào hỏi, trả lời xã giao, trả về null.
Câu hỏi của user: "%s"
""".formatted(message);

        ChatResponse response = openAiChatModel.call(new Prompt(prompt, OpenAiChatOptions.builder().model(OpenAiApi.ChatModel.GPT_4_O_MINI).build()));
        if(response.getResult().getOutput().getText() != null) {
            String content = response.getResult().getOutput().getText();
            if (content.startsWith("```")) {
                content = content.replaceAll("```json", "")
                        .replaceAll("```", "")
                        .trim();
            }
            if (content.equalsIgnoreCase("null")) {
                return null;
            }
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                IntentResponseDTO intentResponseDTO = objectMapper.readValue(content, IntentResponseDTO.class);
                return intentResponseDTO;
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return null;
    }
}
