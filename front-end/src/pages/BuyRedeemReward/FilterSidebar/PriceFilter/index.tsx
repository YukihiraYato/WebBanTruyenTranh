import { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useRedeemReward } from "~/providers/RedeemRewardProivder";

export function PriceFilter() {
  const { setRangePrice } = useRedeemReward();

  const priceValues = [
    "20000-100000",
    "100000-300000",
    "300000-500000",
    "500000-",
  ];

  const priceKeys = [
    "20.000đ - 100.000đ",
    "100.000đ - 300.000đ",
    "300.000đ - 500.000đ",
    "500.000đ trở lên",
  ];

  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleSelect = (value: string) => {
    if (selectedValue === value) {
      // Nếu chọn lại chính nó → hủy chọn
      setSelectedValue("");
      setRangePrice("");
    } else {
      // Chọn mới
      setSelectedValue(value);
      setRangePrice(value);
    }
  };

  return (
    <Box>
      <Typography fontWeight={700} fontSize={16} color={grey[800]} mb={1}>
        Giá
      </Typography>
      {priceKeys.map((label, index) => (
        <FormControlLabel
          key={priceValues[index]}
          control={
            <Checkbox
              checked={selectedValue === priceValues[index]}
              onChange={() => handleSelect(priceValues[index])}
            />
          }
          label={label}
          sx={{ display: "block" }}
        />
      ))}
    </Box>
  );
}
