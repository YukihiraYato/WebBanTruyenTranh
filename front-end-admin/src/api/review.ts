import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'
import { ReviewTypeEnum } from '../types/review'
export const getAllReviews = async (page: number, size: number, keyword: string, type: ReviewTypeEnum | '', minRating: number | '', fromDate: string, toDate: string) => {
    const response = await axiosInstance.get(API_ENDPOINTS.REVIEW.GET_ALL(page, size, keyword, type, minRating, fromDate, toDate))
    return response.data
}

export const deleteReview = async (id: number) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.REVIEW.DELETE(id))
    return response.data
}