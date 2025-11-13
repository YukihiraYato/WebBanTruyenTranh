import {
  Box,
  Link,
  Rating,
  Skeleton,
  Stack,
  styled,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { blue, grey, red, yellow } from "@mui/material/colors";
import { useRedeemReward } from "~/providers/RedeemRewardProivder";
import { useTranslation } from "react-i18next";
import { Avatar } from "@mui/material";
const LabelText = styled(Typography)(() => ({
  fontSize: 14,
  fontWeight: "medium",
}));

const StrongText = styled(Typography)(() => ({
  fontSize: 14,
  fontWeight: "bold",
  color: grey["800"],
}));

const LinkText = styled(Link)(() => ({
  fontSize: 14,
  textDecoration: "none",
  fontWeight: 500,
  color: blue["400"],
  cursor: "pointer",
}));

const WrapText = styled(Box)(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  gap: theme.spacing(1),
}));

export function RedeemRewardOverview({ sx = undefined }: { sx?: SxProps<Theme> }) {
  const { redeemRewards } = useRedeemReward();
  const { t } = useTranslation();
  return (
    <Stack sx={sx} spacing={1}>
      <Typography fontWeight={"bold"} fontSize={25}>
        {redeemRewards?.title}
      </Typography>
      <Box display={"flex"} alignItems={"center"} gap={2}>
        <Typography
          fontSize={"medium"}
          sx={{ color: grey["700"], textDecoration: "line-through" }}
        >
          {redeemRewards?.price.toLocaleString("vi") || "39.950₫"}
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: "#ffb300",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              marginLeft: 1, // tạo khoảng cách giữa tiền và avatar
            }}
          >
            W
          </Avatar>
        </Typography>
      </Box>
      <Box bgcolor={blue["50"]} paddingY={1} paddingX={1} borderRadius={1}>
        <Typography sx={{ color: blue["700"], fontWeight: "medium" }}>
          {t('page.bookDetail.overview.item5')} {redeemRewards?.qtyInStock}
        </Typography>
      </Box>
    </Stack>
  );
}
