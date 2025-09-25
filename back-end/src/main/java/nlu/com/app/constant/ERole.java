package nlu.com.app.constant;

public enum ERole {
    USER("user"), ADMIN("admin"), BOT("bot");
    private String role;
     ERole(String role){
        this.role = role;
    }
}
