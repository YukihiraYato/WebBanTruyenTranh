import API_ENDPOINTS from "../endpoint";
import axiosInstance from "../axios";
import { UserResponseDTO } from "~/types/user";
export const register = async (username: string, password: string, fullName: string, phoneNum: string, email: string, dateOfBirth: string): Promise<UserResponseDTO>=>{
  const result = await axiosInstance.post(API_ENDPOINTS.USER.REGISTER, {username, password, fullName, phoneNum, email, dateOfBirth});
  return result.data;
} 
export const sendOtp = async (email: string): Promise<UserResponseDTO> => {
  return axiosInstance.post(API_ENDPOINTS.USER.SEND_OTP, { email }).then((response) => response.data);
};
export const verifyOtp = async (email: string, otp: string): Promise<UserResponseDTO> => {
  const result = await axiosInstance.post(API_ENDPOINTS.USER.VERIFY_OTP, { email, otp });
  return result.data;
};