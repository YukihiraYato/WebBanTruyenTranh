package nlu.com.app.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateUserForAdminRequestDTO {
    @Email(message = "Email không đúng định dạng")
    private String email;

    private String status;
    private String role;
    private Boolean verified;

    private String fullName;
    private String phoneNum;
    private String gender;
    private LocalDate dob;
}
