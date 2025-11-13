import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  IconButton,
  Link,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import { RedeemRewardGallery } from "../RedeemRewardGallery";
import { BookGalleryMocks } from "~/mocks/BookGalleryMocks";
import { red } from "@mui/material/colors";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import { RedeemRewardOverview } from "../RedeemRewardOverview";
import { RedeemRewardInformation } from "../RedeemRewardInformation";
import { useRedeemReward } from "~/providers/RedeemRewardProivder";
import { useCart } from "~/providers/CartProvider";

import { useState } from "react";

import CustomSnackbar from "~/components/Popup/Snackbar";
import { useTranslation } from "react-i18next";
const CustomizeBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: "white",
  borderRadius: 8,
  padding: theme.spacing(2),
  alignItems: "center",
  gap: theme.spacing(2),
  height: "fit-content",
}));

export function RedeemRewardDetails() {
  const { increaseItem } = useCart();
  const {redeemRewards} = useRedeemReward();
  const [open, setOpen] = useState(false);
  const [openSubDialog, setOpenSubDialog] = useState(false);
  const [initStateSnackbar, setStateSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
    duration: 800,
  });
  const { t } = useTranslation();
  const handleClickOpen = () => {
    setOpenSubDialog(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Container sx={{ paddingRight: "0 !important;" }}>
        <Stack direction={"row"} display={"flex"} gap={2}>
          <CustomizeBox sx={{ position: "sticky", top: 10, bottom: 10 }}>
            <RedeemRewardGallery gallery={BookGalleryMocks} />
            <Box display={"flex"} width={"100%"} gap={2}>
              <Button
                variant="outlined"
                disableTouchRipple
                color="error"
                startIcon={<AddShoppingCartRoundedIcon />}
                sx={{
                  borderWidth: 2,
                  borderColor: red["A700"],
                  textTransform: "none",
                }}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  increaseItem(redeemRewards?.rewardId.toString(), 1, redeemRewards?.typePurchase);
                  setStateSnackbar({
                    open: true,
                    message: "Đã thêm vào giỏ hàng",
                    severity: "success",
                    duration: 800,
                  });
                }}
              >
                <Typography fontWeight={"bold"}>
                  {t("page.bookDetail.buttonAddToCart")}
                </Typography>
              </Button>
              {/* Popup thông báo thêm sách  */}
            </Box>
            
          </CustomizeBox>
          <Stack gap={2}>
            <CustomizeBox>
              <RedeemRewardOverview sx={{ width: "100%" }} />
            </CustomizeBox>
            <CustomizeBox>
              <RedeemRewardInformation />
            </CustomizeBox>
          </Stack>
        </Stack>
      </Container>

    </>
  );
}
