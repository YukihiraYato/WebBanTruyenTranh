package nlu.com.app.dto.request;

import lombok.Getter;

@Getter
public class TopUpWbPointRequestDTO {
    private String nameTopUp;
    private Integer amount;
    private Double value;
}
