import axiosInstance from "../axios";
import API_ENDPOINTS from "../endpoint";

export const saveSearchKeyword = async (keyword: string): Promise<any> => {
  const url = API_ENDPOINTS.USER.KEYWORD_HISTORY.SAVE;
  const res = await axiosInstance.post(url, { keyword });
  return res.data;
}
export const getSearchHistory = async (): Promise<any> => {
  const url = API_ENDPOINTS.USER.KEYWORD_HISTORY.GET;
  const res = await axiosInstance.get(url);
  return res.data;
}
export const deleteSearchHistory = async (keyword: string): Promise<any> => {
  const url = API_ENDPOINTS.USER.KEYWORD_HISTORY.DELETE();
  const res = await axiosInstance.put(url, {keyword});
  return res.data;
}