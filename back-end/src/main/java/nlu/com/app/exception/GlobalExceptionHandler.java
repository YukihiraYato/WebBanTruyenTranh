package nlu.com.app.exception;

import lombok.extern.slf4j.Slf4j;
import nlu.com.app.dto.AppResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
@ResponseBody
public class GlobalExceptionHandler {

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<AppResponse<String>> handleNoResourceFoundException(NoResourceFoundException ex) {
        log.error("NoResourceFoundException: ", ex);
        var response = AppResponse.<String>builder()
                .message(ErrorCode.RESOURCE_NOT_FOUND.getMessage())
                .code(ErrorCode.RESOURCE_NOT_FOUND.getCode())
                .build();

        return ResponseEntity.status(ErrorCode.RUNTIME_EXCEPTION.getStatusCode()).body(response);
    }

    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<AppResponse<String>> handleApplicationException(ApplicationException ex) {
        log.error("Application exception: ", ex);
        var response = AppResponse.<String>builder()
                .message(ex.getErrorCode().getMessage())
                .code(ex.getErrorCode().getCode())
                .build();

        return ResponseEntity.status(ex.getErrorCode().getStatusCode()).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<AppResponse<String>> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: ", ex);
        var response = AppResponse.<String>builder()
                .message(ErrorCode.RUNTIME_EXCEPTION.getMessage())
                .code(ErrorCode.RUNTIME_EXCEPTION.getCode())
                .build();

        return ResponseEntity.status(ErrorCode.RUNTIME_EXCEPTION.getStatusCode()).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<AppResponse<String>> handleUnknownException(Exception ex) {
        log.error("Unknown exception: ", ex);
        var response = AppResponse.<String>builder()
                .message(ErrorCode.UNKNOWN_EXCEPTION.getMessage())
                .code(ErrorCode.UNKNOWN_EXCEPTION.getCode())
                .build();

        return ResponseEntity.status(ErrorCode.UNKNOWN_EXCEPTION.getStatusCode()).body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatusException(ResponseStatusException ex) {
        // Lấy message bạn đã viết ở Service
        String message = ex.getReason();

        // Tạo body lỗi trả về (theo format team bạn quy định)
        Map<String, Object> body = new HashMap<>();
        body.put("errorCode", "INVALID_PAYMENT"); // Hoặc lấy từ 1 enum nào đó nếu cần
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now());


//        {
//    "timestamp": "2023-10-27T10:15:30",
//    "status": 400,
//    "errorCode": "INVALID_PAYMENT_METHOD",
//    "message": "Đối với các sản phẩm bằng xu, vui lòng người dùng chọn thanh toán bằng xu WB Point"
//}
        return new ResponseEntity<>(body, ex.getStatusCode());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("errorCode", "INVALID_HANDLE_CHAT");
        body.put("message", ex.getMessage());
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

}
