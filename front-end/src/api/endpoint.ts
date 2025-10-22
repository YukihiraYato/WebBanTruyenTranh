// src/constants/endpoint.ts

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
    CANCEL: (orderId: string) => `/api/orders/${orderId}/cancel`,
  },
};

export default API_ENDPOINTS;
