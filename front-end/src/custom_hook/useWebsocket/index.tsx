import { useEffect, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";
export default function useWebsocket(userId: number, onMessage: (message: string) => void) {
    const clientRef = useRef<Client | null>(null);
    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,
            debug: (str) =>{
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