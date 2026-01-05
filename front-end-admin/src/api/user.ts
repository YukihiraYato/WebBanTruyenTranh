import { ApiResponse } from '@/types/api'
import { UserDetailsResponseDTO } from '@/types/user'
import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'

export const getUserDetails = async () => {
  const res = await axiosInstance.get<any>(
    API_ENDPOINTS.USER.DETAILS
  )
  return res.data
}
export const getAllUsers = async (page: number, size: number, keyword: string | "", status: string | null, role: string | null): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.get<ApiResponse<any>>(
    API_ENDPOINTS.USER.GET_ALL_USERS(page, size, keyword, status, role)
  )
  return response.data
}
export const createNewUser = async (data: any): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post<ApiResponse<any>>(
    API_ENDPOINTS.USER.CREATE_NEW_USER,
    data
  )
  return response.data
}
export const updateUser = async (userId: number, data: any): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.put<ApiResponse<any>>(
    API_ENDPOINTS.USER.UPDATE_USER(userId),
    data
  )
  return response.data
}
export const resetPassword = async (newPassword: string, confirmPassword: string): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.put<ApiResponse<null>>(
    API_ENDPOINTS.USER.RESET_PASSWORD(),
    {
      newPassword: newPassword,
      confirmPassword: confirmPassword
    }
  )
  return response.data
}
