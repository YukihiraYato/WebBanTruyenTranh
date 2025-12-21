import { LogIn } from "lucide-react"

const API_ENDPOINTS = {
  USER: {
    LOGIN: '/api/v1/auth/login/admin',
    DETAILS: `/api/user-details`,
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
    GET_SALES_MONTHLY: '/admin/api/chart/monthly-sales',
    GET_RECENTLY_ORDERS: '/admin/api/chart/recently-order',
    GET_SUMMARY_DASHBOARD: '/admin/api/chart/summary-dashboard',
    GET_SUMMARY_ABOUT_CUSTOMER: '/admin/api/chart/summary-about-customer',
    GET_TOP_SELLING_PRODUCT: '/admin/api/chart/top-selling',
  },
  REFUND:{
      GET: (orderId: number) => `/api/book/refund-items/get-by-order-id/${orderId}`,
      HANDEL_REFUND_REQUEST: "/api/book/refund-items/handle-request-refund-items",
    }
}

export default API_ENDPOINTS
