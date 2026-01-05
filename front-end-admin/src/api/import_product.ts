import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'

export const getAllReceipts = async (params: { page: number; size: number; status: string | null; keyword?: string | "" }) => {
  const response = await axiosInstance.get(API_ENDPOINTS.IMPORT.GET_ALL(params.page, params.size, params.status || null, params.keyword || ""))
  return response.data
}
export const getReceiptDetails = async (id: number) => {
  const response = await axiosInstance.get(API_ENDPOINTS.IMPORT.GET_DETAILS(id))
  return response.data
}
export const createReceipt = async (data: any) => {
  const response = await axiosInstance.post(API_ENDPOINTS.IMPORT.CREATE_RECEIPT, data)
  return response.data
}
export const approveReceipt = async (id: number) => {
  const response = await axiosInstance.put(API_ENDPOINTS.IMPORT.APPROVE_RECEIPT(id))
  return response.data
}
export const cancelReceipt = async (id: number) => {
  const response = await axiosInstance.put(API_ENDPOINTS.IMPORT.CANCEL_RECEIPT(id))
  return response.data
}
export const searchProductsForImport = async (keyword: string, type: string, page: number) => {
  const response = await axiosInstance.get(API_ENDPOINTS.IMPORT.SEARCH(keyword, type, page))
 return {
        content: response.data.result?.content || [],
        last: response.data.result?.last || false, 
        totalPages: response.data.result?.totalPages || 0
    };
}