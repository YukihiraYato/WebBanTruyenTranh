// Enum rank tương ứng với EUserRank trong Java


// Map field user trong Entity UserPoint
export interface User {
    userId: number;
    fullName: string;
}

// Map chính xác với Entity UserPoint
export interface UserPoint {
  userPointId: number;
  totalPoint: number;      // Điểm hiện tại
  lifetimePoint: number;   // Điểm tích lũy trọn đời
  userRank: string;
  nextRankPoint: number;   // Điểm MỐC cần đạt để lên hạng tiếp theo
  user: User;
  userPointHistories: [];
}