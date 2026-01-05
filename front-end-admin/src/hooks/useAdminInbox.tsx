import { useEffect, useState } from "react"
import { getAllConversations, joinAConversation, leaveAConversation } from "@/api/conversation"

export interface AdminInboxItem {
  conversationId: number
  userId: number
  username: string
  lastMessage: string
  lastMessageTime: string
  status: "WAITING_ADMIN" | "HAS_ADMIN" | "CLOSED"
  currentAdmin?: string
}

export const useAdminInbox = () => {
  const [inbox, setInbox] = useState<AdminInboxItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchInbox = async () => {
    setLoading(true)
    try {
      const res = await getAllConversations()
      setInbox(res.result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInbox()
  }, [])

  return { inbox, loading, refreshInbox: fetchInbox, joinAConversation, leaveAConversation }
}
