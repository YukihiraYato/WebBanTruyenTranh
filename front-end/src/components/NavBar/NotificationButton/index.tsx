import { useEffect, useState } from "react";
import { Box, Button, Divider, Paper, Stack, Typography, Badge } from "@mui/material";
import { grey } from "@mui/material/colors";
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import icoLoginSVG from '~/assets/ico_login.svg'; // Icon cũ của bạn
import { useTranslation } from 'react-i18next';

// Import API và Component mới
import { getAllNotifications, getUnreadNotifications, markNotificationAsRead } from "~/api/user/notification";
import NotificationList from "./NotificationList";
import { NotificationItem } from "~/components/NotificationCard";

// Hàm giả lập lấy userId từ token (Bạn cần thay bằng logic decode JWT thực tế của bạn)
const getUserIdFromToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    // Ví dụ: decode jwt để lấy id, tạm thời mình return 1 số cứng nếu có token
    // const decoded = jwtDecode(token); return decoded.userId;
    return 1; 
};

export function NotificationButton() {
    const { t } = useTranslation();
    
    // 1. Kiểm tra trạng thái đăng nhập từ localStorage
    const accessToken = localStorage.getItem("access_token");
    const userDetails = localStorage.getItem("userDetails");
    const isLoggedIn = Boolean(accessToken); // True nếu có token, False nếu null/undefined
    const userId = userDetails ? JSON.parse(userDetails).userId : null;

    // --- STATE ---
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // --- EFFECT: Polling (Chỉ chạy khi đã Login) ---
    useEffect(() => {
        if (isLoggedIn && userId) {
            // Gọi ngay lần đầu
            fetchData();

            // Set Polling: 15 giây gọi 1 lần
            const interval = setInterval(() => {
                fetchData(); 
            }, 15000);

            return () => clearInterval(interval);
        }
    }, [isLoggedIn, userId]);

    const fetchData = async () => {
        if (!userId) return;
        try {
            // Lấy cả list và số lượng
            const [listRes, countRes] = await Promise.all([
                getAllNotifications(userId),
                getUnreadNotifications(userId)
            ]);
            setNotifications(listRes);
            setUnreadCount(countRes);
        } catch (error) {
            console.error("Lỗi tải thông báo:", error);
        }
    };

    // --- ACTION: Click đọc thông báo ---
    const handleReadNotification = async (id: number) => {
        const targetNote = notifications.find(n => n.id === id);
        if (!targetNote || targetNote.isRead) return;

        try {
            await markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Lỗi update status:", error);
        }
    };

    return (
        <Box sx={{ position: 'relative', zIndex: 1200 }}>
            {/* --- Nút Chuông (Trigger) --- */}
            <Stack 
                direction={'column'} 
                sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    display: { xs: 'none', md: 'flex', },
                    "&:hover ~ .notification-feed": { opacity: 1, visibility: 'visible' } 
                }}
            >
                {/* Chỉ hiện số đỏ (Badge) khi đã đăng nhập */}
                <Badge badgeContent={isLoggedIn ? unreadCount : 0} color="error" max={99}>
                    <NotificationsOutlinedIcon sx={{
                        fontSize: 30,
                        color: { xs: grey[200], md: grey[600] }
                    }}/>
                </Badge>
                
                <Typography sx={{ color: grey[600], fontWeight: 'light', fontSize: '13px', }}>
                    {t('navbar.notifications')}
                </Typography>
            </Stack>

            {/* --- Bảng Thông Báo (Dropdown) --- */}
            <Paper
                className='notification-feed' 
                elevation={4}
                sx={{
                    position: "absolute",
                    top: 50,
                    right: -20, // Căn chỉnh lại một chút
                    // Nếu đã login thì rộng 360px, chưa login thì 250px (như cũ)
                    width: isLoggedIn ? 360 : 250, 
                    bgcolor: "white",
                    borderRadius: 1,
                    display: "flex",
                    flexDirection: 'column',
                    opacity: 0, 
                    visibility: "hidden",
                    transition: "all 0.2s ease-in-out",
                    zIndex: 10,
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.32)",
                    // Giữ hiển thị khi chuột di vào bảng
                    "&:hover": { opacity: 1, visibility: "visible", }, 
                }}
            >
                {/* === LOGIC HIỂN THỊ === */}
                
                {!isLoggedIn ? (
                    // --- CASE 1: CHƯA LOGIN (Giao diện cũ của bạn) ---
                    <Box p={1}>
                        <Stack direction={'row'} alignItems={'center'} spacing={1} p={1}>
                            <NotificationsOutlinedIcon sx={{ fontSize: 25, color: { md: grey[800] } }}/>
                            <Typography fontWeight={600}>Thông báo</Typography>
                        </Stack>
                        <Divider/>
                        <Stack direction={'column'} alignItems={'center'} justifyContent={'center'} spacing={3} py={2}>
                            <img src={icoLoginSVG} alt='icon-login' width={80} height={80}/>
                            <Typography textAlign={'center'} variant="body2">
                                Vui lòng đăng nhập để xem thông báo
                            </Typography>
                        </Stack>
                        <Stack spacing={1} p={1}>
                            <Button variant='contained' color='error' fullWidth>Đăng nhập</Button>
                            <Button variant='outlined' color='error' fullWidth>Đăng ký</Button>
                        </Stack>
                    </Box>
                ) : (
                    // --- CASE 2: ĐÃ LOGIN (Giao diện mới + List) ---
                    <NotificationList 
                        notifications={notifications} 
                        onReadOne={handleReadNotification} 
                    />
                )}
            </Paper>
        </Box>
    )
}