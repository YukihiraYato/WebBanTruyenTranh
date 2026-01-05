// src/components/NotificationCard.tsx
import React, { useState } from "react";
import { Box, Typography, Avatar, Collapse } from "@mui/material";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import DiscountIcon from "@mui/icons-material/Discount";
import RedeemIcon from "@mui/icons-material/Redeem";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Giữ nguyên Type cũ của bạn
export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  createDate: string;
  isRead: boolean;
  type?: "order" | "voucher" | "discountCode" | "system";
};

type NotificationCardProps = {
  item: NotificationItem;
  onRead?: (id: number) => void;
};

// ... (Giữ nguyên phần map Icon và Color cũ của bạn ở đây) ...
const getIcon = (type?: string) => {
  switch (type) {
    case "order": return <ShoppingBasketIcon sx={{ color: "white", fontSize: 20 }} />;
    case "voucher": return <RedeemIcon sx={{ color: "white", fontSize: 20 }} />;
    case "discountCode": return <DiscountIcon sx={{ color: "white", fontSize: 20 }} />;
    default: return <NotificationsIcon sx={{ color: "white", fontSize: 20 }} />;
  }
};

const getIconBgColor = (type?: string) => {
  switch (type) {
    case "order": return "#2196F3";
    case "voucher": return "#FF9800";
    case "discountCode": return "#F44336";
    default: return "#9E9E9E";
  }
};

export default function NotificationCard({ item, onRead }: NotificationCardProps) {
  // State để quản lý việc mở rộng/thu gọn text
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    // 1. Logic Expand/Collapse
    setIsExpanded(!isExpanded);

    // 2. Nếu chưa đọc thì gọi hàm onRead để đánh dấu đã đọc
    if (!item.isRead && onRead) {
      onRead(item.id);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        backgroundColor: item.isRead ? "#FFFFFF" : "#E3F2FD",
        cursor: "pointer",
        padding: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start", // Căn icon lên trên cùng
        gap: 2,
        borderBottom: "1px solid #eee",
        transition: "0.2s",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      {/* Icon Area */}
      <Avatar
        sx={{
          bgcolor: getIconBgColor(item.type),
          width: 40,
          height: 40,
          flexShrink: 0 // Giữ icon không bị co lại khi text dài
        }}
      >
        {getIcon(item.type)}
      </Avatar>

      {/* Content Area */}
      <Box flexGrow={1}>
        {/* Header: Title + Date */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography 
            variant="subtitle2" 
            fontWeight={item.isRead ? "normal" : "bold"}
            color="text.primary"
            sx={{ lineHeight: 1.2, mb: 0.5 }}
          >
            {item.title}
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{whiteSpace: 'nowrap', ml: 1, fontSize: '0.7rem'}}>
             {new Date(item.createDate).toLocaleDateString("vi-VN")}
          </Typography>
        </Box>

        {/* --- PHẦN QUAN TRỌNG: MESSAGE --- */}
        <Typography 
          variant="body2" 
          color={item.isRead ? "text.secondary" : "text.primary"}
          sx={{
            mt: 0.5,
            fontSize: '13px',
            // Logic hiển thị 3 chấm (...)
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            // Nếu expanded = true thì 'unset' (hiện hết), ngược lại thì giới hạn 2 dòng
            WebkitLineClamp: isExpanded ? 'unset' : 2, 
            wordBreak: "break-word" // Xuống dòng nếu từ quá dài
          }}
        >
          {item.message}
        </Typography>

        {/* (Tùy chọn) Hint nhỏ để người dùng biết có thể bấm xem thêm */}
        {!isExpanded && item.message.length > 60 && (
           <Typography variant="caption" color="primary" sx={{ fontSize: '10px', mt: 0.5 }}>
             Xem thêm ▼
           </Typography>
        )}
         {isExpanded && item.message.length > 60 && (
           <Typography variant="caption" color="primary" sx={{ fontSize: '10px', mt: 0.5 }}>
             Thu gọn ▲
           </Typography>
        )}
      </Box>
      
      {/* Chấm xanh đánh dấu chưa đọc (Chỉ hiện khi chưa đọc) */}
      {!item.isRead && (
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2196F3", mt: 1, flexShrink: 0 }} />
      )}
    </Box>
  );
}