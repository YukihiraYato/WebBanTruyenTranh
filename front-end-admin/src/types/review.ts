// Enum cho Review Type
export const ReviewType = {
  BOOK: 'BOOK',
  COLLECTION: 'COLLECTION',
} as const;
export type ReviewTypeEnum = (typeof ReviewType)[keyof typeof ReviewType];

// DTO nhận từ API (AdminReviewResponse)
export interface Review {
  reviewId: number;
  userName: string;
  userEmail: string;
  targetName: string;
  targetType: ReviewTypeEnum;
  rating: number;
  reviewText: string;
  reviewDate: string; // API trả về chuỗi ngày YYYY-MM-DD
  targetImage?: string;
}

// Interface cho params lọc dữ liệu
export interface ReviewSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  type?: ReviewTypeEnum | ''; 
  minRating?: number | '';
  fromDate?: string;
  toDate?: string;
}

// Cấu trúc phản hồi phân trang chuẩn của Spring Boot
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // page hiện tại (bắt đầu từ 0)
}