import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Typography,
    Box,
    Divider,
} from "@mui/material";
import DiscountCard from "~/components/Discount"; // component ở trên
import { useDiscount } from "~/providers/DiscountProvider";
import { useState } from "react";
interface SelectDiscountProps {
    open: boolean;
    onClose: () => void;
    totalPrice: number;
    setTotalPrice?: (price: number) => void;
}
type Discount = {
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
};
export default function SelectDiscountPopup({ open, onClose, totalPrice, setTotalPrice }: SelectDiscountProps) {
    const { listDiscount } = useDiscount();
     const [apply, setApplied] = useState(false);
    // Demo dữ liệu
    const orderDiscounts = listDiscount.filter((d: Discount) => d.targetType === "ORDER");
    const categoryDiscounts = listDiscount.filter((d: Discount) => d.targetType === "CATEGORY");
    const bookDiscounts = listDiscount.filter((d: Discount) => d.targetType === "BOOK");


    // Render 1 section
    const renderSection = (title: string, items: any[]) => (
        <Box mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1} >
                {title}
                <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ marginLeft: 1, fontWeight: "normal" }}
                >
                    (Áp dụng tối đa: 1)
                </Typography>
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    maxHeight: 300, // chỉ cho thấy khoảng 3 cái
                    overflowY: "auto",
                    pr: 1,
                }}
            >
                {items.map((d, i) => (
                    <DiscountCard key={i} {...d} totalPrice={totalPrice} setTotalPrice={setTotalPrice} apply={apply} setApplied={setApplied} />
                ))}
            </Box>
        </Box>
    );

    return (
        <Dialog
            PaperProps={{
                sx: {
                    borderRadius: "15px", // bo góc rõ ràng
                    overflow: "hidden",   // tránh content tràn ra

                },
            }}
            open={open} onClose={onClose} fullWidth >
            <DialogTitle>CHỌN MÃ KHUYẾN MÃI</DialogTitle>

            <DialogContent>
                {/* Ô nhập mã */}
                <Box display="flex" gap={1} >
                    <TextField sx={{ minWidth: "420px" }} size="small" placeholder="Nhập mã khuyến mãi/Quà tặng" />
                    <Button variant="contained">Áp dụng</Button>
                </Box>
                {/* Các section */}
                {renderSection("Mã giảm giá cho Đơn hàng", orderDiscounts)}
                {renderSection("Mã giảm giá theo Danh mục", categoryDiscounts)}
                {renderSection("Mã giảm giá theo Sách", bookDiscounts)}
            </DialogContent>
        </Dialog>
    );
}
