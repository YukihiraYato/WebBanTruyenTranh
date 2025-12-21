import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'

  export const getRefundRequestsByOrderId = async (orderId: number): Promise<any> => {
    const url = API_ENDPOINTS.REFUND.GET(orderId);
    const res = await axiosInstance.get(url);
    return res.data.result;
    }
    export const handleRefundRequest = async (data: {
      status: string;
      adminNote: string;
      typeRefundMethod: string;
      orderId: number;
      isRestock: boolean;
      selectedItems: {
        itemId: number;
        quantity: number;
        type: string;
        finalPrice: number;
      }[];
    }) => {
      const url = API_ENDPOINTS.REFUND.HANDEL_REFUND_REQUEST;
      const res = await axiosInstance.post(url, data);
      return res.data;
    };