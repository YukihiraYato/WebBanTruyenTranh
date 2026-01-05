package nlu.com.app.constant;

public enum EUserStatus {
    ACTIVE("Kích hoạt"), DISABLED("Vô hiệu hóa");
    private final String description;

    EUserStatus(String description) {
        this.description = description;
    }
}
