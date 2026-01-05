package nlu.com.app.constant;

public enum ERole {
    USER("user"), ADMIN("admin"), BOT("bot"), SYSTEM("system");
    private final String role;

    ERole(String role) {
        this.role = role;
    }
}
