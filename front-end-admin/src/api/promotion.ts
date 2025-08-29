import { isAxiosError } from 'axios'
import { ApiResponse, PageApiResponse } from '@/types/api'
import { PromotionCreateRequest, PromotionResponseDTO, PromotionUpdateRequest } from '@/types/promotion'
import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'

export async function getAllPromotion(
  page: number,
  size: number
): Promise<PageApiResponse<PromotionResponseDTO>> {
  return (
    await axiosInstance.get(
      `${API_ENDPOINTS.PROMOTION.GET_ALL_PROMOTION}?page=${page}&size=${size}`
    )
  ).data
}

export async function createNewPromotion(
  request: PromotionCreateRequest
): Promise<ApiResponse<PromotionResponseDTO>> {
  try {
    const response = await axiosInstance.post(
      API_ENDPOINTS.PROMOTION.CREATE,
      request
    )
    return response.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const message = error.response?.data?.message || error.message
      throw new Error(message)
    } else {
      // Lỗi không phải từ Axios (hiếm gặp)
      throw new Error('Unexpected error occurred.')
    }
  }
}
export async function getPromotionDetails(
  id: number
): Promise<ApiResponse<PromotionResponseDTO>> {
  try {
    const response = await axiosInstance.get(
      API_ENDPOINTS.PROMOTION.GET_DETAILS(id)
    )
    return response.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const message = error.response?.data?.message || error.message
      throw new Error(message)
    } else {
      // Lỗi không phải từ Axios (hiếm gặp)
      throw new Error('Unexpected error occurred.')
    }
  }
}
export async function updatePromotion(
  request: PromotionUpdateRequest
): Promise<ApiResponse<PromotionResponseDTO>> {
  try {
    const response = await axiosInstance.put(
      API_ENDPOINTS.PROMOTION.UPDATE,
      request
    )
    return response.data
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const message = error.response?.data?.message || error.message
      throw new Error(message)
    } else {
      // Lỗi không phải từ Axios (hiếm gặp)
      throw new Error('Unexpected error occurred.')
    }
  }
}
