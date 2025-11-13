import { Box, Checkbox, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import QuantityInput from "../../../components/NumberInput";
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
  removeItem
}: CartItemProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      p={2}
      justifyContent={"space-between"}
    >
      {/* Checkbox */}
      <Checkbox
        color="error"
        defaultChecked
        checked={isChecked}
        onChange={() => onToggleCheckbox(book.item.productId)}
      />

      {/* Hình ảnh sách */}
      <Box width={80} height={80} flexShrink={0}>
        <img
          src={book.item.imageUrl}
          alt={book.item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      {/* Thông tin sách */}
      <Box flex={1}>
        <Typography fontWeight="bold">{book.item.title}</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Typography fontWeight="bold">
            {book.item.price.toLocaleString()} đ
          </Typography>
          <Typography
            variant="body2"
            sx={{ textDecoration: "line-through", color: "#888" }}
          >
            {book.item.price.toLocaleString()} đ
          </Typography>
        </Box>
      </Box>

      {/* Bộ chọn số lượng */}
      <Box
        display="flex"
        alignItems="center"
        border="1px solid #ccc"
        borderRadius={1}
      >
        <QuantityInput
         bookId={book.item.productId.toString()}
          value={book.item.quantity}
          onIncrease={(id, val) => increaseItem(id, val,book.typePurchase)}
          onDecrease={(id, val) => decreaseItem(id, val,book.typePurchase)}
        ></QuantityInput>
      </Box>

      {/* Tổng tiền */}
      <Typography color="error" fontWeight="bold" width={100} textAlign="right">
        {(book.item.price * book.item.quantity).toLocaleString()} đ
      </Typography>

      {/* Nút xoá */}
      <IconButton color="error" onClick={() => removeItem?.(book.item.productId.toString())}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}

export default CartItem;
