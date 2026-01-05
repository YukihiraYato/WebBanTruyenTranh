package nlu.com.app.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ImportRequestDTO {
    private String supplierName;
    private String note;
    private List<ImportItemRequestDTO> items;
}
