import axiosInstance from "./../axios";
import API_ENDPOINTS from "./../endpoint";

export const getUserWbPoint = async (userId: number): Promise<any> => {
  const url = API_ENDPOINTS.USER.WB_POINT.GET(userId);
  const res = await axiosInstance.get(url);
  return res.data.result;
}