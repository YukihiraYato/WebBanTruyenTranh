import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Typography,
    Box,
} from "@mui/material";
import DiscountCard from "~/components/Discount";
import { useDiscount } from "~/providers/DiscountProvider";
import { useState, useEffect } from "react";
import { DiscountSelections } from "~/providers/DiscountProvider";
interface SelectDiscountProps {
    open: boolean;
    onClose: () => void;
    totalPrice?: number;
    onUpdateDiscountAmount?: (discountId: number, amount: number) => void;
    setListItem?: React.Dispatch<React.SetStateAction<any[]>>;
    setTotalPrice?: React.Dispatch<React.SetStateAction<number>>;
}

type Discount = {
    discountId: number;
    code: string;
    title: string;
    description: string;
    discountType: string;
    value: number;
    targetType: {
        targetType: string;
        categoryIds?: number[];
    };
    minOrderAmount: number;
    usageLimit: number;
    useCount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
};



export default function SelectDiscountPopup({
    open,
    onClose,
    totalPrice,
    setListItem,
    onUpdateDiscountAmount,
    setTotalPrice
}: SelectDiscountProps) {
    const { listDiscount, setListDiscountChosen, fetchDiscount} = useDiscount();
    const [selectedDiscounts, setSelectedDiscounts] = useState<DiscountSelections>({});

    const groupedDiscounts = {
        ORDER: listDiscount.filter(d => d.targetType.targetType === "ORDER"),
        REDEEM: listDiscount.filter(d => d.targetType.targetType === "REDEEM"),
        BOOK: listDiscount.filter(d => d.targetType.targetType === "BOOK"),
    };

    const handleSelectDiscount = (discount: Discount) => {
        setSelectedDiscounts(prev => {
            const isSelected = prev[discount.targetType.targetType] === discount;
            return {
                ...prev,
                [discount.targetType.targetType]: isSelected ? undefined : discount
            };
        });
    };

    useEffect(() => {
        const selectedList: any[] = [];

        Object.entries(selectedDiscounts).forEach(([type, discount]) => {
            const all = [...groupedDiscounts.ORDER, ...groupedDiscounts.REDEEM, ...groupedDiscounts.BOOK];
            const found = all.find(d => d === discount);
            if (found) selectedList.push(found);
        });

        setListDiscountChosen?.(selectedList);

    }, [selectedDiscounts]);
    useEffect(() => {
        fetchDiscount();
    }, []);

    const renderSection = (title: string, items: Discount[], type: keyof DiscountSelections) => (
        <Box mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                {title}
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    (Áp dụng tối đa: 1)
                </Typography>
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    maxHeight: 300,
                    overflowY: "auto",
                    pr: 1,
                }}
            >
                {items.map((d, i) => (
                    <DiscountCard
                        key={i}
                        {...d}
                        onUpdateDiscountAmount={onUpdateDiscountAmount}
                        totalPrice={totalPrice}
                        isSelected={selectedDiscounts[type] === d}
                        onSelect={() => handleSelectDiscount(d)}
                        setListItem={setListItem}
                        setTotalPrice={setTotalPrice}
                    />
                ))}
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "15px",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle>CHỌN MÃ KHUYẾN MÃI</DialogTitle>
            <DialogContent>
                <Box display="flex" gap={1} mb={2}>
                    <TextField sx={{ minWidth: "420px" }} size="small" placeholder="Nhập mã khuyến mãi/Quà tặng" />
                    <Button variant="contained">Áp dụng</Button>
                </Box>
                {renderSection("Mã giảm giá cho Đơn hàng", groupedDiscounts.ORDER, "ORDER")}
                {renderSection("Mã giảm giá theo Đồ đổi điểm Wb point", groupedDiscounts.REDEEM, "REDEEM")}
                {renderSection("Mã giảm giá theo Sách", groupedDiscounts.BOOK, "BOOK")}
            </DialogContent>
        </Dialog>
    );
}