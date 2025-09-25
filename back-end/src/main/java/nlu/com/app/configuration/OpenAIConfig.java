package nlu.com.app.configuration;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {
    @Value("${spring.ai.openai.api-key}")
    private String apiKey;
    @Bean
    public OpenAiChatModel  openAiChatModel () {
        OpenAiApi openAiApi = OpenAiApi.builder().apiKey(apiKey).build();
        return OpenAiChatModel.builder().openAiApi(openAiApi).build();
    }
}
