package nlu.com.app.constant;

public enum ERefundStatus {
    PENDING_REFUND("Chờ duyệt xác nhận hoàn lại đồ"),
    APPROVED("Chấp thuận"),
    REJECTED("Từ chối hoàn lại đồ");
    private final String status;

    ERefundStatus(String status) {
        this.status = status;
    }
}
