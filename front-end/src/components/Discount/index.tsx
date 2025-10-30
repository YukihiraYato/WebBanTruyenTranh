import { Card, CardContent, Typography, Chip, Button, Box } from "@mui/material";
import PercentIcon from "@mui/icons-material/Percent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useEffect, useState } from "react";
interface DiscountProps {
    discountId: number;
    code: string;
    title: string;
    description: string;
    discountType: string;
    value: number;
    targetType: string;
    minOrderAmount: number;
    usageLimit: number;
    useCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    totalPrice?: number;
    setTotalPrice?: (price: number) => void;

    /** props điều khiển từ cha */
    isSelected: boolean;
    onSelect: () => void;
}

export default function DiscountCard({
    title,
    description,
    code,
    value,
    startDate,
    endDate,
    discountType,
    totalPrice,
    setTotalPrice,
    isSelected,
    onSelect,
}: DiscountProps) {
    const [amountDiscounted, setAmountDiscounted] = useState<number>(0);
    useEffect(() => {
        localStorage.setItem("amountDiscounted", amountDiscounted.toString());
    }, [amountDiscounted]);
    // Logic khi áp dụng (tùy chọn)
    const handleApplyDiscount = () => {
        onSelect(); // thông báo cho cha biết user chọn discount này

        if (totalPrice && setTotalPrice) {
            if (discountType === "PERCENT") {
                setTotalPrice(totalPrice - totalPrice * value);
                setAmountDiscounted(totalPrice * value);
            } else if (discountType === "FIXED") {
                setTotalPrice(totalPrice - value);
                setAmountDiscounted(value);
            }
            
        }
    };

    // Logic khi bỏ chọn (click lại)
    const handleRemoveDiscount = () => {
        onSelect(); // gọi lại cha để unselect
        if (totalPrice && setTotalPrice) {
            if (discountType === "PERCENT") {
                setTotalPrice(totalPrice / (1 - value)); // hoàn lại tiền
            } else if (discountType === "FIXED") {
                setTotalPrice(totalPrice + value);
            }
        }
    };

    return (
        <Card
            variant="outlined"
            sx={{
                marginTop: 1,
                display: "flex",
                alignItems: "center",
                position: "relative",
                borderRadius: 2,
                border: isSelected ? "2px solid #1976d2" : "1px solid #bbb",
                overflow: "visible",
                boxShadow: isSelected
                    ? "0 0 10px rgba(25,118,210,0.3)"
                    : "0 2px 8px rgba(0,0,0,0.15)",
                p: 1.2,
                transition: "all 0.25s ease",
                cursor: "pointer",
            }}
        >
            {/* Bên trái (icon) */}
            <Box
                sx={{
                    width: 70,
                    minWidth: 70,
                    height: 70,
                    backgroundColor: "#ffb74d",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                }}
            >
                <PercentIcon sx={{ color: "white", fontSize: 28 }} />
                <Typography
                    variant="caption"
                    sx={{ color: "white", fontWeight: "bold", mt: 0.5 }}
                >
                    Mã giảm
                </Typography>
            </Box>

            {/* Nội dung */}
            <CardContent sx={{ flex: 1, p: "0 !important" }}>
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                        whiteSpace: "break-spaces",
                        maxWidth: "100%",
                        wordWrap: "break-word",
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        whiteSpace: "break-spaces",
                        maxWidth: "100%",
                        wordWrap: "break-word",
                    }}
                >
                    <span style={{ fontWeight: "bold" }}>Chi tiết: </span> {description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    <span style={{ fontWeight: "bold" }}>Hạn sử dụng: </span>
                    {startDate} <span style={{ fontWeight: "bold" }}>đến</span> {endDate}
                </Typography>
            </CardContent>

            {/* Trạng thái áp dụng */}
            {isSelected ? (
                <Chip
                    onClick={handleRemoveDiscount}
                    icon={<CheckCircleIcon sx={{ color: "green !important" }} />}
                    label="ĐÃ ÁP DỤNG"
                    sx={{
                        fontWeight: "bold",
                        color: "green",
                        border: "1px solid green",
                        backgroundColor: "transparent",
                    }}
                />
            ) : (
                <Button
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 2 }}
                    onClick={handleApplyDiscount}
                >
                    Áp dụng
                </Button>
            )}

            {/* Góc trên bên phải */}
            <Chip
                label="Ví voucher"
                size="small"
                sx={{
                    position: "absolute",
                    top: -5,
                    right: 16,
                    backgroundColor: "#ffd188",
                    border: "1px solid #bbb",
                    fontSize: 11,
                    height: 22,
                    zIndex: 1,
                }}
            />
        </Card>
    );
}
