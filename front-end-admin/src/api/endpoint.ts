import { Leaf, LogIn } from "lucide-react"
import { use } from "react"
import {ReviewTypeEnum} from "@/types/review"
const API_ENDPOINTS = {
  USER: {
    LOGIN: '/api/v1/auth/login/admin',
    DETAILS: `/api/user-details`,
    GET_ALL_USERS: (page: number, size: number, keyword: string | "", status: string | null, role: string | null) => `/admin/user/get-all?page=${page}&size=${size}&keyword=${keyword}&status=${status}&role=${role}`,
    CREATE_NEW_USER: '/admin/user/create',
    UPDATE_USER: (userId: number) => `/admin/user/${userId}`,
    RESET_PASSWORD: () => `/admin/user/reset-password`,
  },
  BOOK: {
    GET_DETAILS: (id: number) => `/admin/api/book/${id}`,
    CREATE: '/api/book/upload',
    UPDATE: (id: number) => `/api/book/${id}/update`,
    OVERVIEW: '/admin/api/book/overview',
  },
  ORDER: {
    SEARCH_ALL_ORDER: `/admin/api/order/search`,
    GET_ALL_ORDER: `/admin/api/order`,
    FILTER_ORDER: (page: number, size: number) => `/api/orders/admin/filter_orders?page=${page}&size=${size}`,
    GET_ORDER_BY_ID: (id: number) => `/admin/api/order/${id}`,
    GET_ORDER_TIMELINE: (id: number) => `/api/orders/${id}/timeline`,
    UPDATE_ORDER_STATUS: (id: number) => `/api/orders/admin/${id}/status`,
    GET_QUANTITY_STATUS: '/api/orders/admin/count_status_order',
  },
  PROMOTION: {
    GET_ALL_PROMOTION: '/admin/api/promotion/',
    GET_DETAILS: (id: number) => `/api/promotion/get/${id}`,
    CREATE: '/admin/api/promotion/create',
    UPDATE: `/api/promotion/update`,
  },
  DISCOUNT: {
    CREATE: "/api/discount/create",
    GET_ALL:(page: number, size: number) => "/api/discount?page=" + page + "&size=" + size,
    UPDATE: "/api/discount/update",
    GET_DETAILS: (id: number) => `/api/discount/detail/${id}`,
  },
  CHART: {
    GET_SALES_MONTHLY:(year: number) => `/admin/api/chart/monthly-sales?year=${year}`,
    GET_RECENTLY_ORDERS:() => `/admin/api/chart/recently-order`,
    GET_SUMMARY_DASHBOARD: (month: number, year: number) => `/admin/api/chart/summary-dashboard?month=${month}&year=${year}`,
    GET_SUMMARY_ABOUT_CUSTOMER: (userId: number) => `/admin/api/chart/summary-about-customer?userId=${userId}`,
    GET_TOP_SELLING_PRODUCT: (year: number, month: number) => `/admin/api/chart/top-selling?year=${year}&month=${month}`,
  },
  REFUND:{
      GET: (orderId: number) => `/api/book/refund-items/get-by-order-id/${orderId}`,
      HANDEL_REFUND_REQUEST: "/api/book/refund-items/handle-request-refund-items",
    },
  CONVERSATION: {
    GET_ALL: "/load-conversation/admin/inbox",
    GET_A_CONVERSATION: (conversationId: number) => `/load-conversation/admin/conversation/${conversationId}`,
    JOIN_A_CONVERSATION: (userId: number) => `/load-conversation/admin/join_conversation/userId/${userId}`,
    LEAVE_A_CONVERSATION: (conversationId: number) => `/load-conversation/admin/leave_conversation/${conversationId}`,
  },
  REVIEW: {
    GET_ALL : (page: number, size: number, keyword: string, type: ReviewTypeEnum | '', minRating: number | '', fromDate: string, toDate: string ) => `/admin/user-review?page=${page}&size=${size}&keyword=${keyword}&type=${type}&minRating=${minRating}&fromDate=${fromDate}&toDate=${toDate}`,
    DELETE: (id: number) => `/admin/user-review/${id}`,
  },
  IMPORT :{
     GET_ALL: (page: number, size: number, status: string | null, keyword: string | null) => `/admin/import-product/get-all?page=${page}&size=${size}&status=${status}&keyword=${keyword}`,
     GET_DETAILS: (id: number) => `/admin/import-product/${id}`,
     CREATE_RECEIPT: '/admin/import-product/create',
     APPROVE_RECEIPT: (id: number) => `/admin/import-product/approve/${id}`,
     CANCEL_RECEIPT: (id: number) => `/admin/import-product/cancel/${id}`,
     SEARCH: (keyword: string, type: string, page: number) => `/admin/import-product/search-product?keyword=${keyword}&typeProduct=${type}&page=${page}`,
  }
}

export default API_ENDPOINTS
