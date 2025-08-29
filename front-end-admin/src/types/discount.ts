export interface DiscountResponse {
  discountId: number;
  code: string;
  title: string;
  description: string;
  discountType: string;
  value: number;
  targetType: string;
  minOrderAmount: number;
  usageLimit: number;
  useCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
export interface DiscountUpdateRequest {
  id: number;
    code: string;
  title: string;
  description: string;
  discountType: string;
  value: number;
  targetType: string;
  minOrderAmount: number;
  usageLimit: number;
  useCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}