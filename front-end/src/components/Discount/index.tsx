import { Card, CardContent, Typography, Chip, Button, Box } from "@mui/material";
import PercentIcon from "@mui/icons-material/Percent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState, useEffect } from "react";
interface DiscountProps {
    discountId: number;
    title: string;
    condition: string;
    expire: string;
    applied?: boolean;
}

export default function DiscountCard({
    title,
    condition,
    expire,
    applied = false,
}: DiscountProps) {
    const [apply, setApplied] = useState(applied);

    return (
        <Card
            variant="outlined"
            sx={{
                marginTop: 1,
                display: "flex",
                alignItems: "center",
                position: "relative",
                borderRadius: 2,
                border: "1px solid #bbb",   // viền đậm hơn
                overflow: "visible",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)", // bóng mềm
                p: 1.2,
                "::before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: -8,
                    transform: "translateY(-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                },
                "::after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    right: -8,
                    transform: "translateY(-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                },
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
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                    {condition}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    HSD: {expire}
                </Typography>
            </CardContent>

            {/* Trạng thái áp dụng */}
            {apply ? (
                <Chip
                    onClick={() => setApplied(false)}
                    icon={<CheckCircleIcon sx={{ color: "green !important"}} />}
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
                    onClick={() => setApplied(true)}
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
                    top: -5,             // đẩy ra ngoài border 1 nửa
                    right: 16,            // canh lề phải
                    backgroundColor: "#ffd188", // cùng màu nền Card
                    border: "1px solid #bbb", // viền trùng với viền card
                    fontSize: 11,
                    height: 22,
                    zIndex: 1,
                }}
            />

        </Card>
    );
}
