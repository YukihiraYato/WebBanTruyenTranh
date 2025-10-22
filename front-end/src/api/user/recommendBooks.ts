import axiosInstance from "../axios";
import API_ENDPOINTS from "../endpoint";

export const getRecommendBooks = async (): Promise<any> => {
  const url = API_ENDPOINTS.USER.RECOMMEND_BOOKS.GET();
  const res = await axiosInstance.get(url);
  return res.data;
}