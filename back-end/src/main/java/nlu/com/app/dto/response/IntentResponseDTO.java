package nlu.com.app.dto.response;

import lombok.Data;

import java.util.List;
import java.util.Map;
@Data
public class IntentResponseDTO {
//    Object sẽ có dạng như này
//    intents = [
//          {"intents1":[
//                { "field1": "giá trị1" },
//                { "field2": "giá trị2" },
//                  ...
//          ]},
//          {"intents2":[
//                { "slot1": "giá trị1" },
//                ...
//          ]},
//             ...
//    ]
    private List<Map<String, List<Map<String, Object>>>> intents;

}
