import axiosInstance from "../axios";
import API_ENDPOINTS from "../endpoint";


export const createBookCollection = async (collectionData: any): Promise<any> => {
  const url = API_ENDPOINTS.USER.BOOKCOLLECTION.CREATE;
  const res = await axiosInstance.post(url, collectionData);
  return res.data;
};
export const addBookToBookCollection = async(collectionId: number, bookIds: number[]) :Promise<any> =>{
  const url = API_ENDPOINTS.USER.BOOKCOLLECTION.ADD_BOOK_TO_BOOK_COLLECTION(collectionId);
  const res = await axiosInstance.post(url, { bookIds });
  return res.data;
}
export const getUserBookCollections = async ({ pageParam  }:{ pageParam: number }): Promise<any> => {
    const page = pageParam;
  const url = API_ENDPOINTS.USER.BOOKCOLLECTION.GET_USER_BOOK_COLLECTIONS(page, 8);
  const res = await axiosInstance.get(url);
  return res.data;
};
export const getDetailsBookCollection = async (collectionId: number): Promise<any> => {
  const url = API_ENDPOINTS.USER.BOOKCOLLECTION.GET_DETAILS_BOOK_COLLECTION(collectionId);
  const res = await axiosInstance.get(url);
  return res.data;
};
export const updateBookCollection = async (collectionId: number, collectionData: any): Promise<any> => {
  const url = API_ENDPOINTS.USER.BOOKCOLLECTION.UPDATE(collectionId);
  const res = await axiosInstance.put(url, collectionData);
  return res.data;
};
export const deleteBookCollection = async (collectionId: number): Promise<any> => {
    const url = API_ENDPOINTS.USER.BOOKCOLLECTION.DELETE_BOOK_COLLECTION(collectionId);
    const res = await axiosInstance.put(url);
    return res.data;
    }
export const deleteBookFromCollectionItem = async (collectionId: number, bookId: number): Promise<any> => {
  const url = API_ENDPOINTS.USER.BOOKCOLLECTION.DELETE_BOOK_FROM_COLLECTIONITEM(collectionId, bookId);
  const res = await axiosInstance.put(url);
  return res.data;
}
export const findBookCollectionByName = async (page: number, name: string): Promise<any> => {
  const url = API_ENDPOINTS.USER.BOOKCOLLECTION.FIND_BOOKCOLLECTION_BY_NAME(page,name);
  const res = await axiosInstance.get(url);
  return res.data;
}