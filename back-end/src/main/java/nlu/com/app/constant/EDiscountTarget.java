package nlu.com.app.constant;

public enum EDiscountTarget {
    ORDER("Order"), BOOK("Book"),REDEEM("Redeem") ;
     EDiscountTarget (String target){
        this.target = target;
    }
    private String target;
     public String getTarget() {
        return target;
    }
}
