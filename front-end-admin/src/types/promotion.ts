export interface PromotionResponseDTO {
  promotionId: number
  discountPercentage: number
  promotionName: string
  startDate: string
  endDate: string
  status: string
  categories: {
    categoryName: string
    categoryId: number
  }[]
}

export interface PromotionCreateRequest {
  
  discountPercentage: number
  promotionName: string
  startDate: string
  endDate: string
  categoryIds: number[]
}
export interface PromotionUpdateRequest {
  promotionId: number
  discountPercentage: number | null
  promotionName: string  | null
  startDate: string  | null
  endDate: string  | null
  categoryIds: number[]  | null
}

