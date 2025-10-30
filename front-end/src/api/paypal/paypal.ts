import axiosInstance from "./../axios";
import API_ENDPOINTS from "./../endpoint";
import { CartItemPropertyResponseDTO} from "../../types/cart";
export const createPaypalOrder = async (data: CartItemPropertyResponseDTO [], listDiscountIds: number[] | null = null): Promise<any> => {
  const url = API_ENDPOINTS.PAYPAL.CREATE_ORDER;
  const requestData = {
    items: data,
    discountIds: listDiscountIds 
  }
  const res = await axiosInstance.post(url, requestData);
  return res.data;
};
export const capturePaypalOrder = async (orderId: string, listIdDiscount : number[] | null = null): Promise<any> => {
   const listDiscountIds = {
    discountIds: listIdDiscount 
  }
  const url = API_ENDPOINTS.PAYPAL.CAPTURE_ORDER(orderId);
  const res = await axiosInstance.post(url, listDiscountIds);
  return res.data;
}