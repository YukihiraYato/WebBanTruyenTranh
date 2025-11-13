import axiosInstance from "./../axios";
import API_ENDPOINTS from "./../endpoint";
import {OrderRequestDTO} from "../../types/order";
export const createPaypalOrder = async (data: OrderRequestDTO): Promise<any> => {
  const url = API_ENDPOINTS.PAYPAL.CREATE_ORDER;
  const res = await axiosInstance.post(url, data);
  return res.data;
};
export const capturePaypalOrder = async (orderId: string, data: OrderRequestDTO): Promise<any> => {
  const url = API_ENDPOINTS.PAYPAL.CAPTURE_ORDER(orderId);
  const res = await axiosInstance.post(url, data);
  return res.data;
}