// src/components/NotificationList.tsx
import React from "react";
import { Box, Typography, Button, Paper, Divider } from "@mui/material";
import NotificationCard, { NotificationItem } from "../../../../components/NotificationCard";
import DoneAllIcon from '@mui/icons-material/DoneAll';

type NotificationListProps = {
  notifications: NotificationItem[];
  onReadOne: (id: number) => void;
};

export default function NotificationList({ notifications, onReadOne }: NotificationListProps) {
  return (
    <Box sx={{ width: "100%", maxHeight: 400, overflowY: "auto" }}>
        {/* Header */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fff", position: 'sticky', top: 0, zIndex: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">Thông báo</Typography>
            <Button size="small" startIcon={<DoneAllIcon />} sx={{ textTransform: 'none', fontSize: 12 }}>
                Đánh dấu đã đọc
            </Button>
        </Box>
        <Divider />

        {/* Content */}
        {notifications.length === 0 ? (
            <Box p={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">Chưa có thông báo nào.</Typography>
            </Box>
        ) : (
            notifications.map((item) => (
                <NotificationCard key={item.id} item={item} onRead={onReadOne} />
            ))
        )}
    </Box>
  );
}