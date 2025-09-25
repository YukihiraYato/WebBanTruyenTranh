package nlu.com.app.constant;

public enum EStatusMessage {
    HAS_ADMIN("Has_Admin"), CLOSED("Closed"), WAITING_ADMIN("Waiting_Admin");
    private String status;

     EStatusMessage(String status){
        this.status = status;
    }

}
