import API_ENDPOINTS from "../endpoint";
import axiosInstance from "../axios";

export const getAllNotifications = async(userId: number) =>{
    const url = API_ENDPOINTS.USER.NOTIFICATIONS.GET(userId);
    const res = await axiosInstance.get(url);
    return res.data.result;
}
export const getUnreadNotifications = async(userId: number) =>{
    const url = API_ENDPOINTS.USER.NOTIFICATIONS.COUNT_UN_READ(userId);
    const res = await axiosInstance.get(url);
    return res.data.result;
}
export const markNotificationAsRead = async(notificationId: number) =>{
    const url = API_ENDPOINTS.USER.NOTIFICATIONS.MARK_READED(notificationId);
    const res = await axiosInstance.put(url);
    return res.data.result;
}