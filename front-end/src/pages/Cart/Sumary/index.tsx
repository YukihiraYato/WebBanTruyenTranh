import { Box, Button, Typography } from "@mui/material";
import { CartItemPropertyResponseDTO } from "~/types/cart";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
interface SumaryProps {
  subTotal?: number;
  finalTotal?: number;
  discountAmount?: number;
  selectedBooks?: CartItemPropertyResponseDTO[];

}
function Sumary({ subTotal= 0, discountAmount =0, finalTotal = 0,  selectedBooks = [] }: SumaryProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Box p={2} borderRadius={2} boxShadow={2} bgcolor="#fff">
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            {"Tạm tính"}
          </Typography>
        </Box>
        <Typography>{Math.round(subTotal).toLocaleString("vi")} đ</Typography>
      </Box>
      {/*  Giảm giá nếu có */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display="flex" alignItems="center">
          <Typography>Giảm giá đơn hàng:</Typography>
        </Box>
        <Typography fontWeight="bold">- {Math.round(discountAmount)?.toLocaleString()} đ</Typography>
      </Box>
      {/* Sumary */}
      <hr />
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Tổng cộng:</Typography>
        <Typography variant="h5" color="error" fontWeight="bold">
          {Math.round(finalTotal).toLocaleString("vi")} đ
        </Typography>
      </Box>
      <Button sx={{ backgroundColor: '#d32f2f', color: 'white', width: '100%' }}
        onClick={() => {
          if (selectedBooks.length !== 0) {
            localStorage.setItem("selectedBooks", JSON.stringify(selectedBooks));
            localStorage.setItem("amountDiscounted", discountAmount.toString());
            navigate("/checkout");
          }

        }}
      >{t('page.cart.pay.item3')}</Button>
    </Box>
  );
}
export default Sumary;
