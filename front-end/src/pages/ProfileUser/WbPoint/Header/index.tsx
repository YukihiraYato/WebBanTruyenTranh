import React from "react";
import { Box, Typography, Stack, Avatar } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

interface WbPointBalanceProps {
  value: number;
}

const WbPointBalance: React.FC<WbPointBalanceProps> = ({ value }) => {
  return (
    <Box
    sx={{
         border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
        borderRadius: '4px',
        p: 2,
        marginBottom: 4,
    }}
    >
      {/* Tiêu đề */}
      <Typography variant="h6" fontWeight={600}>
        Tài khoản Wb-Point
      </Typography>

      {/* Phần hiển thị F-Point */}
      <Stack direction="row" alignItems="center" spacing={2} mt={1}>
        <Typography variant="body2" color="text.secondary">
          Wb-Point hiện có
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: "#ffb300",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            W
          </Avatar>
          <Typography
            variant="subtitle1"
            sx={{ color: "#fbc02d", fontWeight: 600 }}
          >
            {value ? value.toLocaleString() : "0"} Wb-Point
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default WbPointBalance;
