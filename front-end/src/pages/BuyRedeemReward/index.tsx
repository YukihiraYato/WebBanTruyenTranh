import { useEffect, useState } from "react";
import { Container, Grid2, Box, Tabs, Tab, Typography, Paper } from "@mui/material";
import RedeemRewardList from "./RedeemRewardList";
import FilterSidebar from "./FilterSidebar";
import DiscountRedemptionCard, { DiscountResponseDTO } from "./RedeemmableDiscount";
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import ToysIcon from '@mui/icons-material/Toys';
import StarsIcon from '@mui/icons-material/Stars';
import { getUserWbPoint } from "../../api/user/userPoint";
import { useRedeemReward } from "~/providers/RedeemRewardProivder";
// --- MOCK DATA CHO DISCOUNT (Xóa khi nối API thật) ---


function RedeemRewardPage() {
  const { listRedeemmableDiscountForExchangeWbPoint, getRedeemableDiscountFromBackend, redeemDiscount } = useRedeemReward();
  const [tabValue, setTabValue] = useState(0); // 0: Đồ chơi, 1: Voucher
  const userId = localStorage.getItem("userId");
  // Giả lập điểm user (Lấy từ Context hoặc API user profile)
  const [userCurrentPoints, setUserCurrentPoints] = useState<number>(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRedeemDiscount = async (id: number) => {
    // Logic gọi API đổi điểm lấy voucher ở đây
    await redeemDiscount(id);
    await fetchUserPoints();
  };
  const fetchUserPoints = async () => {
    try {
      const response = await getUserWbPoint(Number(userId));
      await getRedeemableDiscountFromBackend();
      setUserCurrentPoints(response.totalPoint);
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };
  useEffect(() => {
    fetchUserPoints();
  }, [tabValue, userId]);
  return (
    <Container sx={{ marginTop: 4, mb: 8 }}>

      {/* 1. Header hiển thị điểm (Optional nhưng nên có) */}
      <Paper
        elevation={0}
        sx={{
          p: 3, mb: 3,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">Kho Quà Tặng & Ưu Đãi</Typography>
          <Typography variant="body2">Sử dụng điểm tích lũy để đổi những phần quà hấp dẫn</Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="caption" sx={{ opacity: 0.9 }}>Điểm của bạn</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <StarsIcon sx={{ color: '#FFC107', fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold">{userCurrentPoints.toLocaleString()}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 2. Thanh Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="reward tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<ToysIcon />} iconPosition="start" label="Đổi Đồ Chơi / Quà Tặng" />
          <Tab icon={<LoyaltyIcon />} iconPosition="start" label="Đổi Mã Giảm Giá" />
        </Tabs>
      </Box>

      {/* 3. Nội dung Tab 0: ĐỒ CHƠI (Layout cũ của bạn) */}
      {tabValue === 0 && (
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 3 }}>
            <FilterSidebar />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 9 }}>
            <RedeemRewardList />
          </Grid2>
        </Grid2>
      )}

      {/* 4. Nội dung Tab 1: MÃ GIẢM GIÁ (Layout mới) */}
      {tabValue === 1 && (
        <Box>
          <Grid2 container spacing={3}>
            {listRedeemmableDiscountForExchangeWbPoint?.map((discount) => (
              <Grid2 size={{ xs: 12, md: 6 }} key={discount.discountId}>
                <DiscountRedemptionCard
                  discount={discount}
                  userCurrentPoints={userCurrentPoints}
                  onRedeem={handleRedeemDiscount}
                />
              </Grid2>
            ))}
          </Grid2>

          {listRedeemmableDiscountForExchangeWbPoint?.length === 0 && (
            <Typography textAlign="center" color="text.secondary" mt={4}>
              Hiện chưa có mã giảm giá nào để đổi.
            </Typography>
          )}
        </Box>
      )}

    </Container>
  );
}

export default RedeemRewardPage;