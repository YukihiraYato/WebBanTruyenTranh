package nlu.com.app.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    RUNTIME_EXCEPTION(9998, "You're doing something wrong, this shouldn't happen", HttpStatus.INTERNAL_SERVER_ERROR),
    UNKNOWN_EXCEPTION(9999, "Something went wrong :(.", HttpStatus.INTERNAL_SERVER_ERROR),
    RESOURCE_NOT_FOUND(1001, "Resource not found, please check again!", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1002, "You are not authenticated!", HttpStatus.UNAUTHORIZED),
    USER_NOT_EXISTED(1003, "User is not existed!", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTED(1004, "User is already existed!", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1005, "Role is not existed!", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTED(1006, "Role is already existed!", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_EXISTED(1007, "Permission is not existed!", HttpStatus.NOT_FOUND),
    UNEXPECTED_BEHAVIOR(1008, "Something went wrong, this action shouldn't perform", HttpStatus.BAD_REQUEST),
    JWT_EXPIRED(1009, "Your session is out of date, please re-login", HttpStatus.FORBIDDEN),
    S3_KEY_OBJECT_DUPLICATED(1010, "Object with same key existed on server", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(1011, "Category not found, please check again!", HttpStatus.NOT_FOUND),
    BOOK_NOT_FOUND(1012, "Book not found, please check again!", HttpStatus.NOT_FOUND),
    GENRE_NOT_FOUND(1013, "Genre not found", HttpStatus.NOT_FOUND),
    BOOK_COLLECTION_NOT_FOUND(1014, "BookCollection not found", HttpStatus.NOT_FOUND),
    CANT_CHANGE_STATUS_ORDER(1010, "The status cannot be changed backwards to a previous state once it has been updated.", HttpStatus.BAD_REQUEST),
    NO_DEFAULT_ADDRESS(1011, "No default address found for user.", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND(1012, "Order cannot be found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(1013, "Your role is not allowed to perform this action", HttpStatus.UNAUTHORIZED),
    PROMOTION_NOT_FOUND(1014, "Promotion cannot be found", HttpStatus.NOT_FOUND),
    NULL_CART_ITEM_REQUEST(1015, "Null cart item request", HttpStatus.BAD_REQUEST),
    NOT_ENOUGH_WB_POINT(1016, "Not enough wb point to checkout", HttpStatus.BAD_REQUEST),
    DISCOUNT_NOT_FOUND(1017, "Discount cannot be found", HttpStatus.NOT_FOUND),
    DISCOUNT_EXPIRED(1018, "Discount has expired", HttpStatus.BAD_REQUEST),
    DISCOUNT_NOT_REDEEMABLE(1019, "Discount is not redeemable", HttpStatus.BAD_REQUEST),
    NOT_ENOUGH_POINT(1020, "Not enough point to redeem this discount", HttpStatus.BAD_REQUEST),
    DISCOUNT_OUT_OF_STOCK(1021, "Discount is out of stock", HttpStatus.BAD_REQUEST),
    DISCOUNT_LIMIT_REACHED(1022, "Discount limit is reached", HttpStatus.BAD_REQUEST),
    RANK_NOT_SUFFICIENT(1023, "Your rank is not sufficient to redeem this discount", HttpStatus.BAD_REQUEST),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
