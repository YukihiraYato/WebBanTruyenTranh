import API_ENDPOINTS from "./endpoint";
import axiosInstance from "./axios";

export const getDiscountForUser = async (userId: number): Promise<any> => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.USER.DISCOUNT.GET(userId));
        return response.data.result;
    } catch (error) {
        console.error("Error fetching discount:", error);
       
    }
};