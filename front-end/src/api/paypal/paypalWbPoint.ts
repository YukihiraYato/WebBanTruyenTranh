import axiosInstance from "./../axios";
import API_ENDPOINTS from "./../endpoint";
export interface CreatePaypalWbPointOrderRequest {
    amount: number;
    value:number;
    nameTopUp: string;
}
export const createPaypalOrder = async (reuqest: CreatePaypalWbPointOrderRequest): Promise<any> => {
  const url = API_ENDPOINTS.PAYPAL.WB_POINT.CREATE_ORDER;
  const requestData = {
    amount: reuqest.amount,
    value: reuqest.value,
    nameTopUp: reuqest.nameTopUp
  }
  const res = await axiosInstance.post(url, requestData);
  return res.data;
};
export const capturePaypalOrder = async (reuqest: CreatePaypalWbPointOrderRequest, orderId: string): Promise<any> => {
   const requestData = {
    amount: reuqest.amount,
    value: reuqest.value,
    nameTopUp: reuqest.nameTopUp
  }
  const url = API_ENDPOINTS.PAYPAL.WB_POINT.CAPTURE_ORDER(orderId);
  const res = await axiosInstance.post(url, requestData);
  return res.data;
}