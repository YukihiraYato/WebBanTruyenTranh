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

interface SelectDiscountProps {
    open: boolean;
    onClose: () => void;
}

export default function SelectDiscountPopup({ open, onClose }: SelectDiscountProps) {
    // Demo dữ liệu
    const orderDiscounts = [
        { title: "Mã Giảm 20K - Toàn Sàn", condition: "Đơn hàng từ 249k", expire: "31/08/2025" },
        { title: "Mã Giảm 10K - Toàn Sàn", condition: "Đơn hàng từ 130k", expire: "31/08/2025" },
        { title: "Mã Giảm 30K - Toàn Sàn", condition: "Đơn hàng từ 399k", expire: "31/08/2025" },
        { title: "Mã Giảm 50K - Toàn Sàn", condition: "Đơn hàng từ 699k", expire: "31/08/2025" },
    ];

    const categoryDiscounts = [
        { title: "Giảm 15K - Manga", condition: "Đơn hàng manga từ 200k", expire: "31/08/2025" },
        { title: "Giảm 20K - Light Novel", condition: "Đơn hàng light novel từ 250k", expire: "31/08/2025" },
        { title: "Giảm 30K - Sách Văn Học", condition: "Đơn hàng văn học từ 400k", expire: "31/08/2025" },
    ];

    const bookDiscounts = [
        { title: "Giảm 10% - Sản phẩm A", condition: "Áp dụng cho sản phẩm A", expire: "31/08/2025" },
        { title: "Giảm 15% - Sản phẩm B", condition: "Áp dụng cho sản phẩm B", expire: "31/08/2025" },
        { title: "Giảm 20% - Sản phẩm C", condition: "Áp dụng cho sản phẩm C", expire: "31/08/2025" },
        { title: "Giảm 25% - Sản phẩm D", condition: "Áp dụng cho sản phẩm D", expire: "31/08/2025" },
    ];

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
                    <DiscountCard key={i} {...d} />
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
