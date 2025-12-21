package nlu.com.app.constant;

public enum ERefundMethod {
    PAYPAL("Thanh toán qua PayPal"),
    WB_POINT("Nạp xu Wb point vào tài khoản"),
    GET_NEW("Nhận lại sản phẩm mới");
    String description;

    ERefundMethod(String description) {
        this.description = description;
    }
}
