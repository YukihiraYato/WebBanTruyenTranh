import { useEffect, useState } from "react"
import { getAConversation } from "@/api/conversation"
export interface MessageUserResponse {
  id: number
  userId: number
  message: string
  createdDate: string
  sender: "USER" | "ADMIN" | "BOT" | "SYSTEM" | "INVALID_HANDLE_CHAT" | "MANAGER"
}

// SOCKET message
export interface SocketMessageDTO {
  sender: "USER" | "ADMIN" | "BOT" | "SYSTEM" | "INVALID_HANDLE_CHAT" | "MANAGER"
  text: string
  sentAt: string
}

export interface ConversationResponseDTO {
  id: number
  clientId: number
  userName: string
  systemName?: string
  message: MessageUserResponse[]
}


export const useAdminConversation = (conversationId?: number) => {
  const [conversation, setConversation] =
    useState<ConversationResponseDTO | null>(null)
  const [loading, setLoading] = useState(false)

  const [messages, setMessages] =
    useState<MessageUserResponse[]>([])
  useEffect(() => {
    if (!conversationId) return

    setLoading(true)

    getAConversation(conversationId)
      .then(res => {
        const conv: ConversationResponseDTO = res.result
        setConversation(conv)
        setMessages(conv.message ?? [])
      })
      .finally(() => setLoading(false))
  }, [conversationId])


  return { messages, setMessages, conversation, setConversation, loading }
}
