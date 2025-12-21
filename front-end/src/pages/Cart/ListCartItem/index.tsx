import { Box, Divider, Typography, Checkbox } from "@mui/material";
import { useCart } from "~/providers/CartProvider";
import CartItem from "../CartItem/";
import { CartItemPropertyResponseDTO } from "~/types/cart";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookItemPropertyResponseDTO } from "~/types/cart";
interface ListCartItemProps {
  listBook: CartItemPropertyResponseDTO[];
  onQuantityChange: (bookId: number, newQuantity: number) => void;
  onToggleCheckbox: (bookId: number) => void;
  onToggleAll: () => void;
  checkedItems: number[];
}

function ListCartItem({
  listBook = [],
  onToggleCheckbox,
  checkedItems,
  onToggleAll,
}: ListCartItemProps) {
  const { increaseItem, decreaseItem, removeItem } = useCart();
 
  const { t } = useTranslation();
 
  return (
    <Box bgcolor={"#f5f5f5"}>
      {/* Header */}
      <Box
        height={2}
        display="flex"
        alignItems="center"
        p={2}
        bgcolor="#fff"
        borderRadius={2}
        marginBottom={1}
        paddingLeft={8}
        paddingRight={8}
      >
        <Checkbox
          color="error"
          checked={
            checkedItems?.length === listBook?.length && listBook?.length > 0
          }
          onChange={onToggleAll}
        />
        <Typography variant="subtitle1" fontWeight="bold" flex={1}>
          {t("page.cart.listBook.checkbox.item1")} ({listBook?.length} {t("page.cart.listBook.checkbox.item2")})
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          width={120}
          textAlign="center"
        >
          {t("page.cart.listBook.amount")}
        </Typography>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          width={120}
          textAlign="right"
        >
          {t("page.cart.listBook.price")}
        </Typography>
      </Box>

      {/*  Danh sách sách */}
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        p={2}
        bgcolor={"#fff"}
        borderRadius={2}
        sx={{
          overflowY: "auto",
          maxHeight: "calc(100vh - 200px)"
        }}
      >
        {listBook?.length > 0 && listBook.map((item) => {
          const itemData = item.item;
          let priceForRenderKey = itemData.price;

          if (item.typePurchase?.toString().toUpperCase() === "BOOK") {
            const bookItem = itemData as BookItemPropertyResponseDTO;
            if (bookItem.discountedPrice !== undefined && bookItem.discountedPrice !== null) {
              priceForRenderKey = bookItem.discountedPrice;
            }
          }
          return (
            <Box key={item.item.productId}>
              <CartItem
                book={item}
                key={`${itemData.productId}-${priceForRenderKey}-${checkedItems.includes(itemData.productId)}`}
                onToggleCheckbox={onToggleCheckbox}
                isChecked={checkedItems.includes(item.item.productId)}
                increaseItem={increaseItem}
                decreaseItem={decreaseItem}
                removeItem={removeItem}
              />
              {item.item.productId !== listBook.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          )
        }

        )}

      </Box>
    </Box>
  );
}

export default ListCartItem;
