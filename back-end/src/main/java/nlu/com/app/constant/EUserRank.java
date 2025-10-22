package nlu.com.app.constant;

public enum EUserRank {
    Bronze("Đồng"), Silver("Bạc"), Gold("Vàng"), Platinum("Bạch Kim"), Diamond("Kim Cương");
    private String level;
    EUserRank(String level) {
        this.level = level;
    }
}
