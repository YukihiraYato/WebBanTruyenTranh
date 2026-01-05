import { Client, IMessage } from "@stomp/stompjs";
import { useEffect, useRef } from "react";
import { SocketMessageDTO, MessageUserResponse } from "../hooks/useAdminConversation";
import { toast } from "sonner";
import { useAdminInbox } from "../hooks/useAdminInbox";
export function useGetUpdatedOrder(onMessage: (message: string) => void) {
    const clientRef = useRef<Client | null>(null);
    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,
            debug: (str) => {
                if (str.includes("ERROR")) {
                    console.error("STOMP error: ", str);
                } else {
                    console.log("STOMP: ", str);
                }
            },
            onConnect: () => {
                console.log("Kết nối tới Websocket thành công");
                client.subscribe("/notifyForAdminAboutOrder", (message: IMessage) => {
                    console.log("Nội dung message: ", message.body)
                    onMessage(message.body);
                })

                // client.publish({
                //     destination: "/app/hello",
                //     body: "Xin chào từ client"
                // });
            },
            onStompError: (frame) => {
                console.error("STOMP error: ", frame, frame.headers, frame.body);
            },

        })
        client.activate();
        clientRef.current = client;
        return () => {
            client.deactivate();
        };
    }, [])


}
export const useAdminChatSocket = (
    conversationId: number | undefined,
    onMessage: (msg: any) => void,
    onInboxUpdate: (data: any) => void
) => {
    const clientRef = useRef<Client | null>(null)
    const {refreshInbox} = useAdminInbox();
    const LEAVE_SUFFIX = "đã rời cuộc trò chuyện. BOT sẽ tiếp tục hỗ trợ.";
    useEffect(() => {
        if (!conversationId) return

        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem("access_token_admin")}`
            },
            onConnect: () => {
                // Chat realtime
                client.subscribe(
                    `/receive/message/conversation/${conversationId}`,
                    msg => {
                        const socketMsg: SocketMessageDTO = JSON.parse(msg.body)
                        if (socketMsg.sender === 'INVALID_HANDLE_CHAT') {
                            toast.error(socketMsg.text,{
                                duration: 2000
                            })
                        } else {
                            const mappedMsg: MessageUserResponse = {
                                id: Date.now(),        // tạm, chỉ để render key
                                userId: 0,             // admin/bot thì không cần
                                message: socketMsg.text,
                                createdDate: socketMsg.sentAt,
                                sender: socketMsg.sender
                            }

                            onMessage(mappedMsg)
                        }

                    }
                )

                // Inbox realtime
                client.subscribe(
                    `/topic/admin/inbox`,
                    msg => {
                        console.log("Inbox realtime msg: ", msg.body)
                    }
                )
            }
        })

        client.activate()
        clientRef.current = client

        return () => {
            client.deactivate()
            clientRef.current = null
        }
    }, [conversationId])

    // 👇 SEND MESSAGE QUA CHÍNH SOCKET NÀY
    const sendAdminMessage = (message: string) => {
        if (!clientRef.current?.connected) return

        clientRef.current.publish({
            destination: "/app/sendMessage/admin",
            body: JSON.stringify({
                conversationId,
                message
            })
        })
    }

    return { sendAdminMessage }
}