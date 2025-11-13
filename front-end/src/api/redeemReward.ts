import API_ENDPOINTS from "./endpoint";
import axiosInstance from "./axios";

export  async function getListRedeemReward(page: number, size: number): Promise<any> {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REDEEM_REWARD.GET(page, size));
    return response.data.result
  } catch (error: any) {
    console.error("Lỗi khi đổi thưởng:", error);
    return { code: error.response?.status || 500, result: error.response?.data?.message || "Lỗi không xác định" };
  }
}
export async function getListRedeemRewardWithFilter(page:number, size: number,  material: string | "", origin: string | "", rangePrice: string | "", keyword: string | ""): Promise<any> {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REDEEM_REWARD.GET_FILTER(page, size, material, origin, rangePrice, keyword));
    return response.data.result
  } catch (error: any) {
    console.error("Lỗi khi đổi thưởng với filter:", error);
    return { code: error.response?.status || 500, result: error.response?.data?.message || "Lỗi không xác định" };
  }
}
export async function searchRedeemReward(keyword: string, page:number, size: number): Promise<any> {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REDEEM_REWARD.SEARCH(keyword, page, size));
    return response.data.result
  } catch (error: any) {
    console.error("Lỗi khi tìm kiếm đổi thưởng:", error);
    return { code: error.response?.status || 500, result: error.response?.data?.message || "Lỗi không xác định" };
  }
}
export async function getARedeemReward(redeemRewardId: number): Promise<any> {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.REDEEM_REWARD.GET_A_REDEEM_REWARD(redeemRewardId));
    return response.data.result
  } catch (error: any) {
    console.error("Lỗi khi lấy thông tin đổi thưởng:", error);
    return { code: error.response?.status || 500, result: error.response?.data?.message || "Lỗi không xác định" };
  }
}