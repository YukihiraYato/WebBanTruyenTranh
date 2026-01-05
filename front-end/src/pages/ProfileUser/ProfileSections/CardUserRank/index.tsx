import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  useTheme
} from '@mui/material';
import {
  EmojiEvents as CrownIcon,
  Star as StarIcon,
  WorkspacePremium as MedalIcon
} from '@mui/icons-material';
import { UserPoint } from "~/types/rank";
import ShieldIcon from '@mui/icons-material/Shield';
import DiamondIcon from '@mui/icons-material/Diamond';
import { SvgIconProps } from '@mui/material';
import { getUserWbPoint } from "~/api/user/userPoint";
import Skeleton from '@mui/material/Skeleton';
import { useState } from "react";
import { set } from 'date-fns';
// Helper để lấy màu sắc dựa trên Rank
const MAIN_RED = '#d32f2f';
// Gradient đỏ cho nền header của card
const RED_GRADIENT = `linear-gradient(135deg, #ef5350 0%, ${MAIN_RED} 100%)`;

const getRankConfig = (rank: string | undefined | null) => {
  // Config mặc định (khi chưa có rank)
  const defaultConfig = {
    label: 'Thành viên',
    headerBg: RED_GRADIENT, // Nền header vẫn giữ màu đỏ Web
    rankColor: '#9E9E9E',   // Màu của Rank (Mặc định xám)
    icon: <ShieldIcon />
  };

  if (!rank) return defaultConfig;

  switch (rank.toUpperCase()) {
    case "BRONZE":
      return {
        label: 'Thành viên Đồng',
        headerBg: RED_GRADIENT,
        rankColor: '#CD7F32', // <--- TRẢ LẠI MÀU ĐỒNG
        icon: <ShieldIcon />
      };
    case "SILVER":
      return {
        label: 'Thành viên Bạc',
        headerBg: RED_GRADIENT,
        rankColor: '#757575', // <--- TRẢ LẠI MÀU BẠC (Đậm hơn chút để rõ trên nền trắng)
        icon: <MedalIcon />
      };
    case "GOLD":
      return {
        label: 'Thành viên Vàng',
        headerBg: RED_GRADIENT,
        rankColor: '#FFC107', // <--- TRẢ LẠI MÀU VÀNG
        icon: <CrownIcon />
      };
    case "PLATINUM":
      return {
        label: 'Thành viên Bạch Kim',
        headerBg: RED_GRADIENT,
        rankColor: '#00BCD4', // <--- TRẢ LẠI MÀU BẠCH KIM (Xanh ngọc)
        icon: <MedalIcon />
      };
    case "DIAMOND":
      return {
        label: 'Thành viên Kim Cương',
        headerBg: RED_GRADIENT,
        rankColor: '#9C27B0', // <--- TRẢ LẠI MÀU KIM CƯƠNG (Tím)
        icon: <DiamondIcon />
      };
    default:
      return defaultConfig;
  }
};
const getNextRankLabel = (currentRank: string): string | null => {
  switch (currentRank.toUpperCase()) {
    case "BRONZE":
      return 'Bạc'; // Đồng -> lên Bạc
    case "SILVER":
      return 'Vàng'; // Bạc -> lên Vàng
    case "GOLD":
      return 'Bạch Kim'; // Vàng -> lên Bạch Kim
    case "PLATINUM":
      return 'Kim Cương'; // Bạch Kim -> lên Kim Cương
    case "DIAMOND":
      return null; // Kim Cương là Max rồi, không còn rank sau
    default:
      return null;
  }
};

interface UserRankCardProps {
  data?: UserPoint;
}

const UserRankCard: React.FC<UserRankCardProps> = () => {
  const [loading, setLoading] = useState(false);
  const initialUserDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
  const [dataUserPoint, setDataUserPoint] = React.useState<UserPoint>({
    userPointId: 0,
    totalPoint: 0,
    userRank: "",
    userPointHistories: [],
    lifetimePoint: 0,
    nextRankPoint: 0,
    user: {
      userId: 0,
      fullName: "",
    },
  });
  useEffect(() => {
    const fetchUserWbPoint = async () => {
      setLoading(true);
      try {
        const userId = Number(localStorage.getItem("userId"));
        if (!isNaN(userId)) {
          const response = await getUserWbPoint(userId);
          setDataUserPoint({
            ...response, user: {
              userId: initialUserDetails.userId,
              fullName: initialUserDetails.fullName,
            }
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy điểm người dùng:", error);
      }

    };
    fetchUserWbPoint();
  }, []);
  if (loading) {
    return (
      <Card elevation={4} sx={{ width: '100%', maxWidth: 360, borderRadius: 4, mt: 5, mx: 'auto', p: 2 }}>
        <Stack spacing={2} alignItems="center">
          <Skeleton variant="circular" width={80} height={80} />
          <Skeleton variant="text" width="60%" height={30} />
          <Skeleton variant="rectangular" width="100%" height={100} />
        </Stack>
      </Card>
    );
  } else {
    if (!dataUserPoint) {
      return null;
    } else {
      const theme = useTheme();
      const rankConfig = getRankConfig(dataUserPoint.userRank);
      // Tính toán số điểm còn thiếu
      const pointsNeeded = dataUserPoint.nextRankPoint - dataUserPoint.lifetimePoint;

      // Tính % Progress: Nếu max rank (Diamond) thì full cây
      const isMaxRank = dataUserPoint.userRank === "DIAMOND";
      const progress = isMaxRank
        ? 100
        : Math.min((dataUserPoint.lifetimePoint / dataUserPoint.nextRankPoint) * 100, 100);

      const nextRankLabel = getNextRankLabel(dataUserPoint.userRank);
      const user= localStorage.getItem("access_token");
      if(!user){
        return null;
      }else{
        return (
        <Card
          elevation={4}
          sx={{
            width: '100%',
            maxWidth: 360,
            borderRadius: 4,
            overflow: 'visible',
            mt: 5,
            mx: 'auto',
            background: '#fff',
            position: 'relative'
          }}
        >
          {/* Background Header */}
        <Box
          sx={{
            height: 90,
            background: rankConfig.headerBg, // Dùng headerBg (Đỏ)
            borderRadius: '16px 16px 0 0',
            position: 'absolute',
            top: 0, left: 0, right: 0
          }}
        />

          <CardContent sx={{ pt: 0, textAlign: 'center', position: 'relative', zIndex: 1 }}>

            {/* Avatar Container */}
            <Box sx={{ position: 'relative', display: 'inline-block', mt: -5, mb: 1 }}>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  background: '#fff',
                  padding: '4px',
                  boxShadow: theme.shadows[3],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: '#fff', // Nền trắng để nổi bật icon màu
                    border: `2px solid ${rankConfig.rankColor}` // Viền màu Rank
                  }}
                >
                  {/* Icon bên trong Avatar đổi màu theo Rank */}
                  {React.cloneElement(rankConfig.icon as React.ReactElement<SvgIconProps>, {
                    sx: { color: rankConfig.rankColor, fontSize: 40 }
                  })}
                </Avatar>
              </Box>

              {/* Badge icon nhỏ ở góc */}
              <Box
                sx={{
                  position: 'absolute', bottom: 0, right: -4,
                  background: rankConfig.rankColor, // Nền badge nhỏ theo màu Rank
                  borderRadius: '50%', padding: '4px', boxShadow: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {/* Icon nhỏ màu trắng */}
                {React.cloneElement(rankConfig.icon as React.ReactElement<SvgIconProps>, {
                  sx: { color: '#fff', fontSize: 14 }
                })}
              </Box>
            </Box>

            {/* Tên User */}
            <Typography variant="h6" fontWeight="700" color="text.primary">
              {dataUserPoint.user.fullName}
            </Typography>

            {/* Rank Label Badge */}
            <Chip
              label={rankConfig.label}
              size="small"
              sx={{
                mt: 1, mb: 3,
                bgcolor: rankConfig.rankColor, // Nền chip theo màu Rank
                color: '#fff', // Chữ trắng
                fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5
              }}
            />

            <Stack spacing={1.5} sx={{ px: 1 }}>

              {/* F-Point (Điểm tiêu dùng) */}
              <Box
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  bgcolor: 'rgba(0,0,0,0.02)', p: 1.5, borderRadius: 2,
                  borderLeft: `4px solid ${rankConfig.rankColor}` // Điểm nhấn viền trái màu Rank
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  F-Point hiện có
                </Typography>
                <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#d32f2f' }}>
                  {dataUserPoint.totalPoint.toLocaleString('vi-VN')}
                </Typography>
              </Box>

              {/* Progress Bar Info */}
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Tiến độ thăng hạng
                  </Typography>
                  <Typography variant="caption" fontWeight="bold">
                    {isMaxRank ? "MAX" : `${dataUserPoint.lifetimePoint.toLocaleString('vi-VN')} / ${dataUserPoint.nextRankPoint.toLocaleString('vi-VN')}`}
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8, borderRadius: 4, bgcolor: '#f5f5f5',
                    '& .MuiLinearProgress-bar': {
                      background: rankConfig.rankColor, // Thanh chạy màu Rank (để biết đang cày rank đó)
                      borderRadius: 4
                    }
                  }}
                />
              </Box>

              {/* Dòng thông báo next rank */}
              {!isMaxRank ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                  Tích lũy thêm <Box component="span" fontWeight="bold" color="text.primary">{pointsNeeded.toLocaleString('vi-VN')}</Box> điểm để lên hạng <Box component="span" fontWeight="bold" color={rankConfig.color}>{nextRankLabel}</Box>
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: rankConfig.rankColor, fontWeight: 'bold' }}>
                  👑 Bạn đã đạt cấp độ tối thượng!
                </Typography>
              )}

            </Stack>
          </CardContent>
        </Card>
      );
      }
      
    };
  }
}

export default UserRankCard;

