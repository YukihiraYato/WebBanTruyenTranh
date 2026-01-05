import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'

export const getAllConversations = async () => {
  const response = await axiosInstance.get(API_ENDPOINTS.CONVERSATION.GET_ALL)
  return response.data
}
export const getAConversation = async (conversationId: number) => {
  const response = await axiosInstance.get(API_ENDPOINTS.CONVERSATION.GET_A_CONVERSATION(conversationId))
  return response.data
}
export const joinAConversation = async (userId: number) => {
  const response = await axiosInstance.put(API_ENDPOINTS.CONVERSATION.JOIN_A_CONVERSATION(userId))
  return response.data
}
export const leaveAConversation = async (conversationId: number) => {
  const response = await axiosInstance.put(API_ENDPOINTS.CONVERSATION.LEAVE_A_CONVERSATION(conversationId))
  return response.data
}