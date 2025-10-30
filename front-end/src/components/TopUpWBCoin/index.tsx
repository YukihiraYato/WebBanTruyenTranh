import React from "react";
import { Card, CardContent, Typography, Stack, Button } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

interface TopUpCardProps {
  value: number; // số tiền
  wibuPointAmount: number; 
  onSelect?: (value: number) => void; // callback khi chọn gói
}

const TopUpCard: React.FC<TopUpCardProps> = ({ value, wibuPointAmount, onSelect }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": { transform: "scale(1.03)", boxShadow: "0 6px 16px rgba(0,0,0,0.15)" },
      }}
      onClick={() => onSelect?.(value)}
    >
      <CardContent>
        <Stack direction="column" spacing={1} alignItems="center">
          <MonetizationOnIcon sx={{ color: "#fbc02d", fontSize: 40 }} />
          <Typography variant="h6" fontWeight="bold">
            Nạp {value.toLocaleString()}₫
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhận {wibuPointAmount.toLocaleString()} Coin
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 1,
              borderRadius: 5,
              textTransform: "none",
              bgcolor: "#fbc02d",
              color: "#000",
              "&:hover": { bgcolor: "#fdd835" },
            }}
          >
            Chọn gói này
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TopUpCard;
