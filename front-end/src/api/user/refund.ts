import axiosInstance from "../axios";
import API_ENDPOINTS from "../endpoint";


export const createRefundRequest = async (refundData: any): Promise<any> => {
  const url = API_ENDPOINTS.USER.REQUEST_REFUND.CREATE;
  const res = await axiosInstance.post(url, refundData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}
export const getRefundRequestsByOrderId = async (orderId: number): Promise<any> => {
  const url = API_ENDPOINTS.USER.REQUEST_REFUND.GET(orderId);
  const res = await axiosInstance.get(url);
  return res.data.result;
}
export const getOrderByStatusDeliverd = async (status: string, page: number, size: number): Promise<any> => {
  const url = API_ENDPOINTS.ORDER.GET_ORDER_BY_STATUS(status, page, size);
  const res = await axiosInstance.get(url);
  return res.data.result;
}