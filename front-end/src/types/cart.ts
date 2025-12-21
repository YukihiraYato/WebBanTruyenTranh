
export interface CartItemResponseDTO {
    code: number;
    result: string;
} 
export interface CartItemPropertyResponseDTO {
    typePurchase: string;
    item: BookItemPropertyResponseDTO | RedeemRewardItemPropertyResponseDTO;
}
export interface BookItemPropertyResponseDTO {
  productId: number;
  quantity: number;
  categoryId: number;
  title: string;
  price: number;
  discountedPrice: number;
  discountPercentage: number;
  imageUrl: string;
  originalPromotionPrice?: number;
}
export interface RedeemRewardItemPropertyResponseDTO {
    productId: number;
    title: string;
    price: number;
    imageUrl: string;
    quantity: number;
    discountedPrice?: number;
}
export interface CartPropertyResponseDTO {
    userId: string;
    items: CartItemPropertyResponseDTO[];
    lastModified: string;
}
export interface CartResponseDTO {
    code: number;
    result: CartPropertyResponseDTO;
    message?: string
}