import { useState, useEffect, useRef } from "react";
import { Box, Paper, Avatar, Typography, List, TextField, IconButton, Divider } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageItem from "~/components/Popup/Chat/MessageItem";
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import { useChat } from "~/custom_hook/useWebsocket";
import { getConversation } from "~/api/user/chat/chat";
import { getUserDetails } from "~/api/user/userDetails";
import { useAuthContext } from "~/context/AuthContext";
import CircularProgress from '@mui/material/CircularProgress';
export default function ChatBox({ botAvatar, userAvatar, width = 340, height = 460 }: { botAvatar: string; userAvatar: string; width?: number; height?: number }) {
    const [open, setOpen] = useState(false);
    const [isLoanding, setIsLoading] = useState(false);
    const [isWattingMessageFromServer, setIsWattingMessageFromServer] = useState(false);
    const token = localStorage.getItem("access_token");
    const [intrdouction, setIntroduction] = useState([
        {
            sender: "BOT", text: "Xin chào! Mình là trợ lý AI (Thử nghiệm) từ Wibu Bookstore.", sentAt: new Date().toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        },
        {
            sender: "BOT", text: "1. Tư vấn sản phẩm\n2. Chăm sóc khách hàng\n3. Bảo hành sản phẩm\n4. Hỗ trợ kỹ thuật", sentAt: new Date().toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        }
    ]);
    const [messages, setMessages] = useState<any[]>([]);

    const [input, setInput] = useState("");
    const listRef = useRef<HTMLDivElement>(null);
    const [conversationId, setConversationId] = useState<number>(0);
    const { sendMessage } = useChat(setMessages, setIsWattingMessageFromServer, conversationId as number, token as string);
    const { jwtToken } = useAuthContext();
    useEffect(() => {
        // auto-scroll khi messages thay đổi
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);
    useEffect(() => {
        const getConversationsAPI = async () => {
            console.log("JWT in chatbox:", jwtToken);
            try {
                if (open && jwtToken) {

                    setIsLoading(true);
                    const userDetails = (await getUserDetails()).result;
                    const userId = userDetails.userId;
                    const data = (await getConversation(userId)).result;
                    const listMessage = data.message;
                    setConversationId(data.id);
                    const mapListMessage = listMessage.map((msg: any) => ({
                        sender: msg.sender,
                        text: msg.message,
                        sentAt: new Date(msg.createdDate).toLocaleString("vi-VN", {
                            timeZone: "Asia/Ho_Chi_Minh",
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        })
                    }));
                    setIsLoading(false);
                    setMessages(prev =>
                        [...prev, ...mapListMessage]
                    );
                }
                if (jwtToken === "") {
                    setMessages([]);
                }
            } catch (err) {
                console.error("Failed to fetch conversations:", err);
            }
        }
        getConversationsAPI();
    }, [open, jwtToken])

    const handleSend = () => {
        if (!token) {
            alert("Vui lòng đăng nhập để sử dụng chức năng chat.");
            setInput("");
            return;
        }
        if (!input.trim()) return;
        const newMsg = {
            sender: "USER", text: input.trim(), sentAt: new Date().toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            })
        };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        // Gửi tin nhắn lên server qua websocket
        setTimeout(() => {
            sendMessage({
                message: input.trim(),
                timeSendMessage: new Date().toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                })
            });
            // Tin nhắn phản hồi giả lập từ bot
            setMessages(prev => [
                ...prev,
                {
                    sender: "BOT", text: "Cảm ơn! Mình đã nhận được tin nhắn của bạn, hãy đợi mình 1 chút nhé !", sentAt: new Date().toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    })
                }
            ]);
            setIsWattingMessageFromServer(true);

        }, 700);
    };

    return (
        <Box style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
        }}>
            {open ? (
                <Paper
                    elevation={8}
                    sx={{
                        position: "fixed",
                        bottom: 18,
                        right: 18,
                        width,
                        height,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        overflow: "hidden"
                    }}
                >
                    {/* Header */}
                    <Box sx={{ p: 1.25, bgcolor: "#C92127", color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar src={botAvatar} alt="bot" />
                        <Box>
                            <Typography variant="subtitle1" fontWeight="700">Chatbot Wibu Bookstore</Typography>
                        </Box>
                        {/* Nút đóng thu nhỏ lại */}
                        <IconButton
                            size="small"
                            sx={{ color: "white", marginLeft: "auto", marginRight: 0 }}
                            onClick={() => setOpen(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Chat content */}
                    <Box ref={listRef} sx={{ flex: 1, overflowY: "auto", bgcolor: "#f5f5f5", p: 1 }}>
                        <List disablePadding>
                            {intrdouction.map((m, i) => {
                                const isUser = m.sender === "USER";
                                return <MessageItem key={i} msg={m} isUser={isUser} avatarSrc={isUser ? userAvatar : botAvatar} />;
                            })}
                        </List>
                        <List disablePadding>
                            {(messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())).map((m, i) => {
                                const isUser = m.sender === "USER";
                                return <MessageItem key={i} msg={m} isUser={isUser} avatarSrc={isUser ? userAvatar : botAvatar} />;
                            })}
                        </List>
                        {isWattingMessageFromServer && (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
                                <CircularProgress size={20} />
                            </Box>
                        )}

                    </Box>

                    <Divider />

                    {/* Input */}
                    <Box sx={{ display: "flex", p: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            multiline
                            maxRows={4}
                            fullWidth
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {

                                    e.preventDefault(); // ngăn chèn newline
                                    handleSend();
                                }

                            }}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSend}
                            sx={{ ml: 1, alignSelf: "flex-end" }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Paper>
            ) : (
                <IconButton
                    onClick={() => setOpen(true)}
                    sx={{
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        width: 56,
                        height: 56,
                        boxShadow: 4,
                        "&:hover": {
                            bgcolor: "primary.dark",
                        },
                    }}
                >
                    <ChatIcon />
                </IconButton>
            )}
        </Box>
    );
}