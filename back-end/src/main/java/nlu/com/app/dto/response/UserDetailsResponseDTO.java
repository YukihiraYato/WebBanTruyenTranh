package nlu.com.app.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Builder
@Getter
@Setter
public class UserDetailsResponseDTO {
    Long userId;
    String fullName; // default: "Chưa thiết lập"
    String gender; // default: "Chưa thiết lập"
    String phoneNum; // default: "Chưa thiết lập"
    Boolean verified;
    String email; // default: "Chưa thiết lập"
    String username;
    String status;
    @JsonFormat(pattern = "dd-MM-yyyy")
    LocalDate dateOfBirth;
    String role;

}
