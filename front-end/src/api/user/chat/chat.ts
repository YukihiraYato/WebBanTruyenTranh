import axiosInstance from "../../axios";
import API_ENDPOINTS from "../../endpoint";

export const getConversation = async(userId: number): Promise<any> =>{
    const url = API_ENDPOINTS.USER.CHAT.GET_CONVERSATIONS(userId);
    const res = await axiosInstance.get(url);
    return res.data;
}