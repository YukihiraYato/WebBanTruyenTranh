import React, { useState } from "react";
import {
  Grid,
  Typography,
  Box,
  Stack,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import TopUpCard from "../../../../components/TopUpWBCoin";
import PaypalButtonForWbPoint from "../../CheckoutWbPointByPaypal";
import { CreatePaypalWbPointOrderRequest } from "../../../../api/paypal/paypalWbPoint";

const TopUpList: React.FC = () => {
  const topUpOptions = [
    { value: 10000, wibuPointAmount: 10000 },
    { value: 20000, wibuPointAmount: 20000 },
    { value: 50000, wibuPointAmount: 50000 },
    { value: 100000, wibuPointAmount: 100000 },
    { value: 200000, wibuPointAmount: 200000 },
    { value: 500000, wibuPointAmount: 500000 },
    { value: 1000000, wibuPointAmount: 1000000 },
    { value: 2000000, wibuPointAmount: 2000000 },
  ];

  const [selectedValue, setSelectedValue] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [showPaypal, setShowPaypal] = useState<boolean>(false);

  const [topUpObject, setTopUpObject] =
    useState<CreatePaypalWbPointOrderRequest>({
      amount: 0,
      value: 0,
      nameTopUp: "",
    });

  const updateTopUpObject = (value: number, qty: number) => {
    setTopUpObject({
      amount: qty,
      value: value,
      nameTopUp: `Nạp ${qty} gói WibuPoint ${value.toLocaleString()}₫`,
    });
  };

  const handleSelect = (value: number) => {
    setSelectedValue(value);
    setQuantity(1);
    updateTopUpObject(value, 1);
  };

  const handleIncrease = () => {
    if (!selectedValue) return;
    setQuantity((prev) => {
      const newQty = prev + 1;
      updateTopUpObject(selectedValue, newQty);
      return newQty;
    });
  };

  const handleDecrease = () => {
    if (!selectedValue) return;
    setQuantity((prev) => {
      const newQty = prev > 1 ? prev - 1 : 1;
      updateTopUpObject(selectedValue, newQty);
      return newQty;
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedValue) return;
    const val = parseInt(e.target.value);
    const safeVal = isNaN(val) || val < 1 ? 1 : val;
    setQuantity(safeVal);
    updateTopUpObject(selectedValue, safeVal);
  };

  const total = selectedValue ? selectedValue * quantity : 0;

  const handleShowPaypal = () => {
    if (!selectedValue) {
      alert("Vui lòng chọn gói nạp trước!");
      return;
    }
    setShowPaypal(true);
    localStorage.setItem("selectedTopUp", JSON.stringify(topUpObject));
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Chọn gói nạp
      </Typography>

      <Grid container spacing={2}>
        {topUpOptions.map((option) => (
          <Grid item xs={6} sm={4} md={3} key={option.value}>
            <TopUpCard
              value={option.value}
              wibuPointAmount={option.wibuPointAmount}
              onSelect={handleSelect}
            />
          </Grid>
        ))}
      </Grid>

      {selectedValue !=0 && (
        <Box
          sx={{
            border: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
            borderRadius: "4px",
            p: 2,
          }}
          mt={4}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Gói bạn đã chọn: {selectedValue.toLocaleString()}₫
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} mt={2}>
            <Typography variant="body1" sx={{ minWidth: 100 }}>
              Số lượng:
            </Typography>
            <IconButton onClick={handleDecrease} color="primary">
              <RemoveIcon />
            </IconButton>
            <TextField
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              size="small"
              inputProps={{ min: 1, style: { textAlign: "center", width: 60 } }}
            />
            <IconButton onClick={handleIncrease} color="primary">
              <AddIcon />
            </IconButton>
          </Stack>

          <Typography
            variant="h6"
            sx={{ mt: 2, color: "#fbc02d", fontWeight: 700 }}
          >
            Tổng cộng: {total.toLocaleString()}₫
          </Typography>

          {!showPaypal ? (
            <Button
              variant="contained"
              color="warning"
              sx={{
                mt: 2,
                px: 4,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 3,
              }}
              onClick={handleShowPaypal}
            >
              Thanh toán bằng PayPal
            </Button>
          ) : (
            <Box
              sx={{
                mt: 2,
                px: 4,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 3,
                maxWidth: 300,
              }}
            >
              <PaypalButtonForWbPoint />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TopUpList;
