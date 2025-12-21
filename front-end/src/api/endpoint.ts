// src/constants/endpoint.ts

import { use } from "react";

const API_ENDPOINTS = {
  BOOK: {
    SUMMARY_ABOUT_BOOK: "/api/book",
    SEARCH: "/api/book/category",
    TOP_WEEKLY: "/api/book/top-weekly",
    DETAILS: (bookId: number) => `/api/book/${bookId}`,
    SEARCH_V2: "/api/book/search",
  },
  CATEGORY: {
    CHAIN_FOR_BOOK: `/api/category/chain`,
    CATEGORY: "api/book",
  },
  PROMOTION: {
    GET_ACTIVE: "/api/promotion/active",
  },
  REVIEW: {
    GET_BOOK_REVIEWS: (bookId: number) => `/api/book/${bookId}/reviews`,
    CREATE_REVIEW_FOR_BOOK: `/api/review/create`,
    GET_REVIEW_OVERALL: (bookId: number) =>
      `/api/book/${bookId}/review-overall`,
  },
  USER: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    SEND_OTP: "/api/v1/auth/register/send-otp",
    VERIFY_OTP: "/api/v1/auth/register/verify-otp",
    DETAILS: {
      GET: "/api/user-details",
      ADD: "/api/user-details/add",
    },
    ADDRESS: {
      ADD: "/api/user/addresses",
      UPDATE: (userAddressId: number, makeDefault?: boolean) => {
        let url = `/api/user/addresses/${userAddressId}`;
        if (makeDefault !== undefined) {
          url += `?makeDefault=${makeDefault}`;
        }
        return url;
      },
      GET: "/api/user/addresses",
    },
    BOOKCOLLECTION: {
      CREATE: "/api/collections",
      GET_USER_BOOK_COLLECTIONS: (page: number, size: number) => {
        if (page !== undefined && size !== undefined) {
          return `/api/collections?page=${page}&size=${size}`;
        } else {
          return `/api/collections`;
        }
      },
      GET_DETAILS_BOOK_COLLECTION: (collectionId: number) => {
        return `/api/collections/${collectionId}`;
      },
      UPDATE: (collectionId: number) => {
        return `/api/collections/${collectionId}`;
      },
      ADD_BOOK_TO_BOOK_COLLECTION: (collectionId: number) => {
        return `/api/collections/${collectionId}/books`;
      },
      DELETE_BOOK_COLLECTION: (collectionId: number) => {
        return `/api/collections/${collectionId}/delete`;
      },
      DELETE_BOOK_FROM_COLLECTIONITEM: (collectionId: number, bookId: number) => {
        return `/api/collections/${collectionId}/books/${bookId}/delete`;
      },
      FIND_BOOKCOLLECTION_BY_NAME: (page: number, name: string) => {
        return `/api/collections/search?name=${name}&page=${page}`
      }
    },
    CHAT: {
      GET_CONVERSATIONS: (userId: number) => {
        return `/load-conversation/user/${userId}`;
      }
    },
    KEYWORD_HISTORY: {
      SAVE: "/api/search-history/save",
      GET: "/api/search-history/get",
      DELETE: () => `/api/search-history/delete`,
    },
    RECOMMEND_BOOKS: {
      GET: () => `/recommend`,
    },
    DISCOUNT: {
      GET: (userId: number) => `/api/discount/user/${userId}`,
    },
    WB_POINT: {
      GET: (userId: number) => `/user-point/get/user?userId=${userId}`,
    },
    REQUEST_REFUND:{
      CREATE: "/api/book/refund-items/request-create",
      GET: (orderId: number) => `/api/book/refund-items/get-by-order-id/${orderId}`,
    }

  },
  CART: {
    ADD: "/api/cart/add",
    REMOVE: "/api/cart/delete",
    GET: "/api/cart",
  },
  PAYPAL: {
    CREATE_ORDER: "/paypal/api/orders",
    CAPTURE_ORDER: (orderId: string) => `/paypal/api/orders/${orderId}/capture`,
    WB_POINT:{
      CREATE_ORDER: "/user-point-paypal/orders",
      CAPTURE_ORDER:(orderId: string) => `/user-point-paypal/orders/${orderId}/capture`,
    }
  },
  ORDER: {
    CREATE: "/api/orders",
    GET: (page: number, size: number) => {
      if (page !== undefined && size !== undefined) {
        return `/api/orders?page=${page}&size=${size}`;
      } else {
        return `/api/orders`;
      }
    },
    GET_ORDER_BY_STATUS: (status: string, page: number, size: number) => {
      return `/api/orders/get-by-status?status=${status}&page=${page}&size=${size}`;
    },
    CANCEL: (orderId: string) => `/api/orders/${orderId}/cancel`,
  },
  REDEEM_REWARD:{
      GET: (page: number, size: number) => {
        return `/redeem-reward?page=${page}&size=${size}`;
      },
      GET_FILTER:(page:number, size:number, material: string | "", origin: string | "", rangePrice: string | "", keyword: string | "") => {
        let url = `/redeem-reward/filter?page=${page}&size=${size}&material=${material}&origin=${origin}&rangePrice=${rangePrice}&keyword=${keyword}`;
        return url;
      },
      SEARCH:(keyword: string, page:number, size: number) => {
        return `/redeem-reward/search?keyword=${keyword}&page=${page}&size=${size}`;
      },
      // api này lấy đồ chơi đổi thưởng
      GET_A_REDEEM_REWARD:(redeemRewardId: number) => {
        return `/redeem-reward/${redeemRewardId}`;
      },
      GET_REDEEMABLE_DISCOUNT: (userId: number) => `/redeem-reward/get-redeemable-discount/${userId}`,
      REDEEM_DISCOUNT_REWARD: (discountId: number) => `/redeem-reward/redeem/${discountId}`,
      
  } 
};

export default API_ENDPOINTS;
