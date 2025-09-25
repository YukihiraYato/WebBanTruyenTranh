import { useEffect, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import { useCallback } from "react";
import { Dispatch, SetStateAction } from "react";
export interface MessageRequest {
    message: string;
    timeSendMessage: string;
}
export interface Message {
    sender: string;
    text: string;
    sentAt: string;
}

export function useWebsocket(userId: number, onMessage: (message: string) => void) {
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
                client.subscribe(`/notifyOrderStatus/userId/${userId}`, (message: IMessage) => {
                    console.log("Nội dung message: ", message.body)
                    onMessage(message.body);
                }),
                    client.subscribe("/notifyOrderStatus/public", (message) => {
                        console.log("📩 Nhận từ server:", message.body);
                    });
                client.publish({
                    destination: "/app/hello",
                    body: "Xin chào từ client"
                });
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
    }, [userId, onMessage])


}

export function useChat(setMessage: Dispatch<SetStateAction<Message[]>>, setIsWattingMessageFromServer: Dispatch<SetStateAction<boolean>>,conversationId: number, token: string) {
    const clientRef = useRef<Client | null>(null);

    const sendMessage = useCallback((payload: MessageRequest) => {
        if (clientRef.current?.connected) {
            try {
                clientRef.current.publish({
                    destination: "/app/sendMessage/user",
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.error("Send message failed:", err);
            }
        } else {
            console.warn("Websocket not connected");
        }
    }, []);

    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            connectHeaders: {
                Authorization: "Bearer " + token
            },
            reconnectDelay: 5000,
            debug: str => console.log("STOMP:", str),
            onConnect: () => {
                client.subscribe(`/receive/message/conversation/${conversationId}`,
                    (message: IMessage) => {
                        console.log("Received raw message:", message.body);
                        const parsedMessage = JSON.parse(message.body);
                        console.log("Received message:", parsedMessage);
                        const mapMessage = {
                            sender: parsedMessage.sender,
                            text: parsedMessage.text,
                            sentAt: new Date(parsedMessage.sentAt).toLocaleString("vi-VN", {
                                timeZone: "Asia/Ho_Chi_Minh",
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                            })
                        }
                        setIsWattingMessageFromServer(false);
                        setMessage(prev => [...prev, mapMessage]);
                    }
                );
                console.log(" Websocket connected");
            },
            onStompError: frame => {
                console.error("STOMP error: ", frame);
            }
        });
        clientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
        };
    }, [conversationId, setMessage]);

    return { sendMessage };
}
