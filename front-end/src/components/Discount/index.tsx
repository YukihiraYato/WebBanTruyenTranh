import { Card, CardContent, Typography, Chip, Button, Box } from "@mui/material";
import PercentIcon from "@mui/icons-material/Percent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useEffect, useState } from "react";
import { isCategoryEligible } from "~/constant/category";
import { BookItemPropertyResponseDTO } from "~/types/cart"; // Import thêm type để ép kiểu cho chuẩn
import { useCart } from "~/providers/CartProvider";
interface DiscountProps {
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
    totalPrice?: number;


    /** props điều khiển từ cha */
    isSelected: boolean;
    onSelect: () => void;
    setListItem?: React.Dispatch<React.SetStateAction<any[]>>;
    onUpdateDiscountAmount?: (discountId: number, amount: number) => void;
    setTotalPrice?: React.Dispatch<React.SetStateAction<number>>;
}

export default function DiscountCard({
    discountId,
    title,
    description,
    code,
    value,
    startDate,
    endDate,
    discountType,
    totalPrice,
    onUpdateDiscountAmount,
    minOrderAmount,
    isSelected,
    onSelect,
    targetType,
    setListItem,
}: DiscountProps) {

    const { cart } = useCart();

    // 1. Logic tính toán giá mới cho từng Item (Pure Function)
    const executeDiscountLogic = (currentList: any[]) => {
        switch (targetType.targetType) {
            case "BOOK":
                return currentList.map((cartItem) => {
                    const type = cartItem.typePurchase?.toString().toUpperCase().trim();
                    if (type === "BOOK") {
                        const itemData = cartItem.item as BookItemPropertyResponseDTO;

                        if (isCategoryEligible((itemData as any).categoryId, targetType.categoryIds)) {
                            const currentAdminPrice = itemData.discountedPrice || itemData.price;
                            let finalPrice = currentAdminPrice;

                            if (discountType === "PERCENT") {
                                finalPrice = currentAdminPrice - (currentAdminPrice * value);
                            } else if (discountType === "FIXED") {
                                finalPrice = currentAdminPrice - value;
                            }
                            if (finalPrice < 0) finalPrice = 0;

                            const backupPrice = (itemData as any).originalPromotionPrice !== undefined
                                ? (itemData as any).originalPromotionPrice
                                : itemData.discountedPrice;

                            return {
                                ...cartItem,
                                item: {
                                    ...itemData,
                                    discountedPrice: finalPrice,
                                    originalPromotionPrice: backupPrice
                                }
                            };
                        }
                    }
                    return cartItem;
                });

            case "REDEEM":
                return currentList.map((cartItem) => {
                    const type = cartItem.typePurchase?.toString().toUpperCase().trim();
                    if (type === "REDEEM" || type === "REWARD") {
                        const itemData = cartItem.item as any;
                        const basePrice = itemData.price;
                        let finalPrice = basePrice;

                        if (discountType === "PERCENT") {
                            finalPrice = basePrice - (basePrice * value);
                        } else if (discountType === "FIXED") {
                            finalPrice = basePrice - value;
                        }
                        if (finalPrice < 0) finalPrice = 0;

                        return {
                            ...cartItem,
                            item: { ...itemData, discountedPrice: finalPrice }
                        };
                    }
                    return cartItem;
                });

            default:
                return currentList;
        }
    };

    // Helper tính tổng (để biết item giảm bao nhiêu)
    const calculateTotal = (items: any[]) => {
        return items.reduce((total, cartItem) => {
            const itemData = cartItem.item;
            const finalPrice = (itemData.discountedPrice !== undefined && itemData.discountedPrice !== null)
                ? itemData.discountedPrice
                : itemData.price;
            return total + (finalPrice * itemData.quantity);
        }, 0);
    };

    // 2. EFFECT: Xử lý Voucher ORDER (Tự động tính & Báo cáo)
    useEffect(() => {
        // Chỉ chạy nếu voucher này là ORDER và đang được chọn
        if (targetType.targetType === "ORDER" && onUpdateDiscountAmount && totalPrice !== undefined) {
            
            // Nếu không chọn -> Báo 0
            if (!isSelected) {
                onUpdateDiscountAmount(discountId, 0);
                return;
            }

            // Kiểm tra Min Order
            if (minOrderAmount > 0 && totalPrice < minOrderAmount) {
                // Không đủ điều kiện -> Báo giảm 0 đồng (nhưng vẫn giữ trạng thái Selected để khi đủ tiền thì tự giảm lại)
                // Hoặc có thể hiển thị cảnh báo UI ở đây
                console.warn(`Voucher ${code} không đủ điều kiện min order`);
                onUpdateDiscountAmount(discountId, 0);
                return;
            }

            // Tính tiền giảm
            let newAmount = 0;
            if (discountType === "PERCENT") {
                newAmount = totalPrice * value;
            } else if (discountType === "FIXED") {
                newAmount = value;
                // Không giảm quá tổng tiền
                if (newAmount > totalPrice) newAmount = totalPrice;
            }

            // Báo cáo số tiền giảm lên Cha (Cart.tsx)
            onUpdateDiscountAmount(discountId, newAmount);
        }
    }, [totalPrice, isSelected, discountId]); // Dependency chuẩn

    // 3. EFFECT: Tự động Re-apply Item Discount khi Cart thay đổi (API update số lượng)
    useEffect(() => {
        if (isSelected && targetType.targetType !== "ORDER" && setListItem && cart) {
            console.log("🔄 Re-applying Item Discount logic...");
            setListItem((prevList) => {
                const newList = executeDiscountLogic(prevList);
                
                // Tính số tiền tiết kiệm được để báo cáo (nếu cần)
                const newTotal = calculateTotal(newList);
                const oldTotal = calculateTotal(prevList);
                const savedAmount = oldTotal - newTotal;

                // Nếu voucher item cũng muốn báo cáo tổng tiền tiết kiệm cho Cha
                if (onUpdateDiscountAmount) {
                    onUpdateDiscountAmount(discountId, savedAmount);
                }
                
                return newList;
            });
        }
    }, [cart, isSelected]); // Chỉ chạy khi Cart gốc đổi hoặc trạng thái chọn đổi

    // 4. Handle Click Apply
    const handleApplyDiscount = () => {
        onSelect(); // Toggle UI state

        // Logic ORDER đã được useEffect xử lý tự động khi isSelected thay đổi -> Không cần code ở đây

        // Logic ITEM (Book/Redeem) thì cần chạy ngay lập tức để update UI List
        if (targetType.targetType !== "ORDER" && setListItem) {
            setListItem((prevList) => {
                const newList = executeDiscountLogic(prevList);
                
                const newTotal = calculateTotal(newList);
                const oldTotal = calculateTotal(prevList);
                
                if (onUpdateDiscountAmount) {
                    onUpdateDiscountAmount(discountId, oldTotal - newTotal);
                }
                return newList;
            });
        }
    };

    // 5. Handle Click Remove
    const handleRemoveDiscount = () => {
        onSelect(); // Toggle UI state -> isSelected = false

        // Logic ORDER: useEffect sẽ tự chạy (do isSelected đổi) và báo cáo 0 -> OK

        // Logic ITEM: Cần khôi phục giá thủ công
        if (targetType.targetType === "BOOK" && setListItem) {
            setListItem((prevList) => {
                const recoveredList = prevList.map((cartItem) => {
                    const type = cartItem.typePurchase?.toString().toUpperCase().trim();
                    if (type === "BOOK") {
                        const itemData = cartItem.item as any;
                        return {
                            ...cartItem,
                            item: {
                                ...itemData,
                                discountedPrice: itemData.originalPromotionPrice // Restore
                            }
                        };
                    }
                    return cartItem;
                });
                
                // Báo cáo giảm 0 đồng
                if (onUpdateDiscountAmount) onUpdateDiscountAmount(discountId, 0);
                return recoveredList;
            });
        } 
        else if ((targetType.targetType === "REDEEM" || targetType.targetType === "REWARD") && setListItem) {
            setListItem((prevList) => {
                const recoveredList = prevList.map((cartItem) => {
                    const type = cartItem.typePurchase?.toString().toUpperCase().trim();
                    if (type === "REWARD" || type === "REDEEM") {
                        const itemData = cartItem.item as any;
                        return {
                            ...cartItem,
                            item: {
                                ...itemData,
                                discountedPrice: undefined // Reset
                            }
                        };
                    }
                    return cartItem;
                });

                if (onUpdateDiscountAmount) onUpdateDiscountAmount(discountId, 0);
                return recoveredList;
            });
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
            {/* ... Phần UI giữ nguyên như cũ ... */}

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