package nlu.com.app.constant;

public enum EDiscountType {
   PERCENT("Giảm theo %"), FIXED("Giảm theo tiền");
   private String description;
   EDiscountType(String description) {
       this.description = description;
   }
   public String getDescription() {
       return description;
   }
}
