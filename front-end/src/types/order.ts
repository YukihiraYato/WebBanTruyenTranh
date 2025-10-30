export interface OrderRequestDTO{
    paymentMethodId : number,
    selectedProductIds : number[],
    listDiscountIds?: number[]
}
export interface timeFor5StatusOrderObject {
    pendingConfirmationDate: string,
                confirmedDate: string,
                shippingDate: string,
                deliveredDate: string,
                cancelledDate: string
}
