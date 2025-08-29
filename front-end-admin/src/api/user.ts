import { ApiResponse } from '@/types/api'
import { UserDetailsResponseDTO } from '@/types/user'
import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'

export const getUserDetails = async () => {
  const res = await axiosInstance.get<UserDetailsResponseDTO>(
    API_ENDPOINTS.USER.DETAILS
  )
  return res.data
}
