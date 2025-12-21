import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  LocalOffer as TagIcon,
  AccessTime as TimeIcon,
  MonetizationOn as CoinIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";

// Import DTO (Giả sử bạn đã generate hoặc copy DTO này vào project)
// import { DiscountResponseDTO } from "~/types/discount";

// Định nghĩa lại interface dựa trên DTO bạn cung cấp nếu chưa có file type riêng
export interface DiscountResponseDTO {
  discountId: number;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  value: number;
  targetType: {
    targetType: string;
    categoryIds?: number[];
  };
  minOrderAmount: number;
  usageLimit: number;
  useCount: number;
  usageLimitPerUser: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  booksId?: number[];
  rankForVipCustomer?: string;
  pointCost: number;
}

interface DiscountRedemptionCardProps {
  discount: DiscountResponseDTO;
  userCurrentPoints: number; // Điểm hiện tại của user để check điều kiện
  onRedeem: (discountId: number) => Promise<void>; // Hàm gọi API đổi điểm
}

export default function DiscountRedemptionCard({
  discount,
  userCurrentPoints,
  onRedeem,
}: DiscountRedemptionCardProps) {
  const [loading, setLoading] = useState(false);

  // 1. Logic kiểm tra điều kiện
  const isOutOfStock =
    discount.usageLimit !== -1 && discount.useCount >= discount.usageLimit;
  const isNotEnoughPoints = userCurrentPoints < discount.pointCost;
  const isDisabled = isOutOfStock || isNotEnoughPoints || !discount.isActive;

  // 2. Logic hiển thị giá trị giảm (VD: 10% hoặc 50.000đ)
  const displayValue =
    discount.discountType === "PERCENT"
      ? `${(discount.value * 100).toLocaleString()}%` // Giả sử value 0.1 = 10%
      : `${discount.value.toLocaleString()}đ`;

  // 3. Logic hiển thị Progress Bar (Số lượng còn lại)
  // Nếu usageLimit = -1 (vô hạn) thì luôn full 100%
  const progressValue =
    discount.usageLimit === -1
      ? 100
      : Math.max(0, 100 - (discount.useCount / discount.usageLimit) * 100);

  // 4. Xử lý đổi quà
  const handleRedeemClick = async () => {
    if (isDisabled) return;
    setLoading(true);
    try {
      await onRedeem(discount.discountId);
    } catch (error) {
      console.error("Redeem failed", error);
    } finally {
      setLoading(false);
    }
  };
  // Đổi sang kiểu ngày tháng năm
  const formatDateSafe = (dateString: string) => {
    try {
      const parsedDate = parse(dateString, 'dd-MM-yyyy', new Date());
      return format(parsedDate, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      return dateString;
    }
  };
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // Responsive: Dọc trên mobile, ngang trên PC
        position: "relative",
        overflow: "hidden",
        border: "1px solid #e0e0e0",
        borderRadius: 3,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
        opacity: isDisabled ? 0.7 : 1,
        bgcolor: isOutOfStock ? "#f5f5f5" : "white",
      }}
    >
      {/* --- PHẦN 1: HÌNH ẢNH / ICON GIÁ TRỊ --- */}
      <Box
        sx={{
          width: { xs: "100%", sm: 140 },
          background: isOutOfStock
            ? "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)" // Xám nếu hết hàng
            : "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)", // Cam đỏ nổi bật
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          p: 2,
          position: "relative",
        }}
      >
        {/* Border răng cưa trang trí kiểu tem phiếu */}
        <Box
          sx={{
            position: "absolute",
            right: -6,
            top: "50%",
            transform: "translateY(-50%)",
            height: "80%",
            borderRight: "6px dotted white",
            display: { xs: "none", sm: "block" },
          }}
        />

        <Typography variant="h4" fontWeight="900" sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
          {displayValue}
        </Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9, mt: 0.5, textTransform: 'uppercase' }}>
          OFF
        </Typography>
        {discount.rankForVipCustomer && (
          <Chip
            label={`Rank ${discount.rankForVipCustomer}`}
            size="small"
            sx={{
              mt: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.65rem",
              backdropFilter: "blur(4px)",
            }}
          />
        )}
      </Box>

      {/* --- PHẦN 2: NỘI DUNG CHI TIẾT --- */}
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom lineHeight={1.2}>
              {discount.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1
            }}>
              {discount.description}
            </Typography>
          </Box>
          {/* Badge loại discount */}
          <Chip
            label={discount.targetType.targetType === "BOOK" ? "Sách" : "Đơn hàng"}
            size="small"
            color="default"
            variant="outlined"
            sx={{ fontSize: 10, height: 20 }}
          />
        </Box>

        {/* Thông tin phụ: Hạn dùng & Min Order */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
            <TimeIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">
              Hết hạn: {formatDateSafe(discount.endDate)}
            </Typography>

          </Box>
          {discount.minOrderAmount > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ bgcolor: '#f0f0f0', px: 1, borderRadius: 1 }}>
              Đơn tối thiểu: {discount.minOrderAmount.toLocaleString()}đ
            </Typography>
          )}
        </Box>

        <Box mt="auto">
          {/* Thanh Progress số lượng */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              {discount.usageLimit === -1 ? "Không giới hạn" : `Đã đổi: ${discount.useCount}/${discount.usageLimit}`}
            </Typography>
            {discount.usageLimitPerUser > 0 && (
              <Typography variant="caption" color="primary.main">
                (Tối đa {discount.usageLimitPerUser}/người)
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: progressValue < 20 ? 'error.main' : 'success.main'
              }
            }}
          />
        </Box>
      </CardContent>

      {/* --- PHẦN 3: NÚT HÀNH ĐỘNG (Bên phải) --- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          bgcolor: "#fafafa",
          borderLeft: { sm: "1px dashed #e0e0e0" },
          borderTop: { xs: "1px dashed #e0e0e0", sm: "none" },
          minWidth: 140,
        }}
      >
        <Box display="flex" alignItems="center" mb={{ xs: 0, sm: 1 }} mr={{ xs: 2, sm: 0 }}>
          <CoinIcon sx={{ color: "#FFC107", mr: 0.5 }} />
          <Typography variant="h6" fontWeight="bold" color={isNotEnoughPoints ? "error" : "text.primary"}>
            {discount.pointCost}
          </Typography>
          <Typography variant="caption" color="text.secondary" ml={0.5}>xu</Typography>
        </Box>

        <Tooltip title={
          isOutOfStock ? "Đã hết lượt đổi" :
            isNotEnoughPoints ? `Bạn cần thêm ${discount.pointCost - userCurrentPoints} xu` :
              "Đổi ngay"
        }>
          <Box> {/* Cần bọc Button trong Box để Tooltip hoạt động khi Button disabled */}
            <Button
              variant="contained"
              disabled={isDisabled || loading}
              onClick={handleRedeemClick}
              startIcon={isOutOfStock || isNotEnoughPoints ? <LockIcon /> : <CheckIcon />}
              color={isNotEnoughPoints ? "error" : "primary"}
              sx={{
                borderRadius: 50,
                textTransform: "none",
                px: 3,
                fontWeight: "bold",
                boxShadow: "none",
                width: "100%",
                whiteSpace: "nowrap"
              }}
            >
              {loading ? "Đang xử lý..." : isOutOfStock ? "Hết hàng" : "Đổi Quà"}
            </Button>
          </Box>
        </Tooltip>
      </Box>
    </Card>
  );
}