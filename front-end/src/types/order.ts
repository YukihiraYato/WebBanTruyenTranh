import {CartItemPropertyResponseDTO  } from "./cart";
export interface OrderRequestDTO{
    paymentMethodId : number,
    items : CartItemPropertyResponseDTO[],
    listDiscountIds?: number[]
}
export interface timeFor5StatusOrderObject {
    pendingConfirmationDate: string,
                confirmedDate: string,
                shippingDate: string,
                deliveredDate: string,
                cancelledDate: string
}
