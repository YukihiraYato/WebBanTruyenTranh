import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'

export const createDiscount = async (data: any) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.DISCOUNT.CREATE, data)
    return response.data
  } catch (error) {
    console.error("Error creating discount:", error)
    throw error
  }
}
export const getAllDiscounts = async (page: number, size: number) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DISCOUNT.GET_ALL(page, size))
    return response.data
  } catch (error) {
    console.error("Error fetching discounts:", error)
    throw error
  }
}
export const updateDiscount = async (data: any) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.DISCOUNT.UPDATE, data)
    return response.data
  } catch (error) {
    console.error("Error updating discount:", error)
    throw error
  }
}
export const getDiscountDetails = async (id: number) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.DISCOUNT.GET_DETAILS(id))
    return response.data
  } catch (error) {
    console.error("Error fetching discount details:", error)
    throw error
  }
}