import { Box, Checkbox, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import QuantityInput from "../../../components/NumberInput"; // Check lại path import của bạn
import { CartItemPropertyResponseDTO } from "~/types/cart";
import {CartResult} from "~/providers/CartProvider";

interface CartItemProps {
  book: CartItemPropertyResponseDTO;
  onToggleCheckbox: (bookId: number) => void;
  isChecked: boolean;
  increaseItem: (bookId: string, quantity: number, typePurchase: string) => Promise<CartResult>;
  decreaseItem: (bookId: string, quantity: number, typePurchase: string) => Promise<CartResult>;
  removeItem?: (bookId: string) => Promise<CartResult>;
}

function CartItem({
  book,
  onToggleCheckbox,
  isChecked,
  increaseItem,
  decreaseItem,
  removeItem,
}: CartItemProps) {
  const itemData = book.item;

  // --- 1. LẤY GIÁ HIỂN THỊ AN TOÀN ---
  // Ép kiểu 'as any' để lấy discountedPrice cho cả BOOK và REDEEM/REWARD
  // Logic: Nếu có discountedPrice hợp lệ -> dùng nó. Không thì dùng price.
  const discountedPrice = (itemData as any).discountedPrice;
  
  const displayPrice = (discountedPrice !== undefined && discountedPrice !== null) 
      ? discountedPrice 
      : itemData.price;

  // Debug: Xem component thực sự nhận được giá bao nhiêu
  console.log(`Item: ${itemData.title} | Price Gốc: ${itemData.price} | Giá Giảm: ${discountedPrice} => Hiển thị: ${displayPrice}`);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      p={2}
      justifyContent={"space-between"}
      sx={{ borderBottom: "1px solid #eee" }}
    >
      {/* Checkbox */}
      <Checkbox
        color="error"
        checked={isChecked}
        onChange={() => onToggleCheckbox(itemData.productId)}
      />

      {/* Hình ảnh */}
      <Box width={80} height={80} flexShrink={0} border="1px solid #eee" borderRadius={1} overflow="hidden">
        <img
          src={itemData.imageUrl}
          alt={itemData.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* Thông tin item */}
      <Box flex={1} ml={1}>
        <Typography fontWeight="bold" variant="body1">
            {itemData.title}
        </Typography>
        
        <Box display="flex" gap={1} alignItems="center" mt={0.5}>
          {/* GIÁ HIỆN TẠI (Đã xử lý logic hiển thị ở trên) */}
          <Typography fontWeight="bold" color="error">
            {displayPrice.toLocaleString("vi")} đ
          </Typography>

          {/* GIÁ GỐC GẠCH NGANG (Chỉ hiện nếu có giảm giá) */}
          {displayPrice < itemData.price && (
            <Typography
              variant="body2"
              sx={{ textDecoration: "line-through", color: "#888" }}
            >
              {itemData.price.toLocaleString("vi")} đ
            </Typography>
          )}
        </Box>
        
        {/* Badge Type (Optional) */}
        <Typography variant="caption" color="text.secondary" sx={{fontSize: '0.7rem'}}>
            {book.typePurchase}
        </Typography>
      </Box>

      {/* Bộ chọn số lượng */}
      <Box
        display="flex"
        alignItems="center"
        border="1px solid #ccc"
        borderRadius={1}
      >
        <QuantityInput
          bookId={itemData.productId.toString()}
          value={itemData.quantity}
          onIncrease={(id, val) => increaseItem(id, val, book.typePurchase)}
          onDecrease={(id, val) => decreaseItem(id, val, book.typePurchase)}
        />
      </Box>

      {/* --- 2. SỬA LỖI LOGIC TÍNH TỔNG --- */}
      {/* Code cũ của bạn check: type === "BOOK" ? discount : price */}
      {/* Code mới: Nhân thẳng số lượng với displayPrice đã tính ở trên */}
      <Typography color="error" fontWeight="bold" width={100} textAlign="right">
        {(itemData.quantity * displayPrice).toLocaleString("vi")} đ
      </Typography>

      {/* Nút xoá */}
      <IconButton color="default" onClick={() => removeItem?.(itemData.productId.toString())}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}

export default CartItem;