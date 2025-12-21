// src/lib/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {

    const status = error.response.status;
    const data = error.response.data as { code?: number; message?: string };

    console.warn(" API Error:", status, data);

    //  Token hết hạn
    if (data.code === 1009) {
      alert("Tài khoản đã hết phiên sử dụng, vui lòng đăng nhập lại.");

      //  Xóa toàn bộ localStorage 
      localStorage.clear();

      //  Redirect về trang  home
      window.location.href = "/";

      //  return để chặn tiếp tục xử lý
      return Promise.reject(error);
    }
    if (data.code === 1016){
      alert("Bạn không đủ WB point để thanh toán đơn hàng này.");
    }
    if(status === 400 && data.message === "Đối với các sản phẩm bằng xu, vui lòng người dùng chọn thanh toán bằng xu WB Point"){
      alert(data.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
