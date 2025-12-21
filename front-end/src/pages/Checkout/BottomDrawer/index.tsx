import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";
import shadows from "@mui/material/styles/shadows";
import PaypalButton from "~/components/Paypal";
import { createOrder } from "~/api/order";
import { useNavigate } from "react-router-dom";
import { useCart } from "~/providers/CartProvider";
import { CartItemPropertyResponseDTO } from "~/types/cart";
import { useTranslation } from "react-i18next";
import { AddressResponseDTO } from "~/types/user";
import { useDiscount } from "~/providers/DiscountProvider";
import { DiscountType } from "~/providers/DiscountProvider";
export function BottomDrawer({
  sx = undefined,
  totalPrice = 0,
  paymentMethod,
  listAddress,
}: {
  sx?: SxProps<Theme>;
  totalPrice?: number;
  paymentMethod?: string;
  listAddress?: AddressResponseDTO[];
}) {
  const { listDiscountChosen } = useDiscount();
  const discountId = listDiscountChosen.reduce((acc, discount) => {
    if (discount?.discountId) {
      acc.push(discount.discountId);
    }
    return acc;
  }, [] as number[]);

  const selectBooks = JSON.parse(localStorage.getItem("selectedBooks") || "[]");

  const navigate = useNavigate();
  const { removeItem } = useCart();
  const { t } = useTranslation();

  const [showPaypal, setShowPaypal] = useState(false);
  const amountDiscounted = localStorage.getItem("amountDiscounted");
  function handelCreateOrder(paymentMethodId: number) {
    if (!listAddress || listAddress.length === 0) {
      alert(
        t(
          "Người dùng chưa có địa chỉ giao hàng. Xin vui lòng tạo ít nhất 1 địa chỉ để có thể thanh toán được"
        )
      );
      return;
    }

    createOrder({
      paymentMethodId: paymentMethodId,
      items: selectBooks,
      listDiscountIds: discountId 
    })
      .then(() => {
        selectBooks.forEach((book: CartItemPropertyResponseDTO) => {
          removeItem?.(book.item.productId.toString());
        });
        localStorage.removeItem("selectedBooks");
        navigate("/profileUser/orders");
      })
   
  }

  function handlePaypalClick() {
    if (!listAddress || listAddress.length === 0) {
      alert(
        t(
          "Người dùng chưa có địa chỉ giao hàng. Xin vui lòng tạo ít nhất 1 địa chỉ để có thể thanh toán được"
        )
      );
      return;
    }
    setShowPaypal(true);
  }

  return (
    <Box
      sx={{
        ...sx,
        backgroundColor: "white",
        width: "100%",
        boxShadow: shadows["20"],
        paddingY: 2,
      }}
    >
      <Container>
        <Stack gap={0.5}>
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Box width={400} textAlign={"right"}>
              <Typography sx={{ fontSize: 14 }}>
                {t("page.checkout.content.bottomDrawer.item1")}
              </Typography>
            </Box>
            <Box width={200} textAlign={"right"}>
              <Typography sx={{ fontSize: 14 }}>
                {totalPrice.toLocaleString("vi-VN") + " đ"}
              </Typography>
            </Box>
          </Box>
          {amountDiscounted && (
            <Box display={"flex"} justifyContent={"flex-end"}>
              <Box width={400} textAlign={"right"}>
                <Typography sx={{ fontSize: 14 }}>
                  {t("page.checkout.content.bottomDrawer.item2")}
                </Typography>
              </Box>
              <Box width={200} textAlign={"right"}>
                <Typography sx={{ fontSize: 14 }}>
                  {"-"}{amountDiscounted + " đ"}
                </Typography>
              </Box>
            </Box>
          )}
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Box width={400} textAlign={"right"}>
              <Typography sx={{ fontWeight: 700 }}>
                {t("page.checkout.content.bottomDrawer.item3")}
              </Typography>
            </Box>
            <Box width={200} textAlign={"right"}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 18, color: red["900"] }}
              >
                {
              totalPrice.toLocaleString("vi-VN") + " đ"}
              </Typography>
            </Box>
          </Box>
        </Stack>
        <Divider sx={{ mt: 1 }} />
        <Box display={"flex"} mt={2}>
          <FormControlLabel
            control={<Checkbox defaultChecked />}
            label={t("page.checkout.content.bottomDrawer.item4")}
          />

          {paymentMethod === "pay-with-paypal" && (
            <Box
              sx={{ marginLeft: "auto", cursor: "pointer" }}
              onClick={handlePaypalClick}
            >
              {!showPaypal && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                >
                  {"Thanh toán với Paypal"}
                </Button>
              )}

              {showPaypal && <PaypalButton />}
            </Box>
          )}

          {paymentMethod === "pay-on-delivery" && (
            <Button
              sx={{ marginLeft: "auto" }}
              size="small"
              variant="contained"
              color="error"
              disableFocusRipple
              disableRipple
              disableTouchRipple
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                handelCreateOrder(1);
              }}
            >
              {t("page.checkout.content.bottomDrawer.item5")}
            </Button>
          )}
            {paymentMethod === "pay-on-wb_point" && (
            <Button
              sx={{ marginLeft: "auto" }}
              size="small"
              variant="contained"
              color="error"
              disableFocusRipple
              disableRipple
              disableTouchRipple
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                handelCreateOrder(8);
              }}
            >
              {t("page.checkout.content.bottomDrawer.item5")}
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}
