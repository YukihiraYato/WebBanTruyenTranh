import { Box, Container, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText, Button } from "@mui/material";
import GavelIcon from '@mui/icons-material/Gavel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { useNavigate } from "react-router-dom";

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom color="primary">
          CHÍNH SÁCH ĐỔI TRẢ & HOÀN TIỀN
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Tại Wibu Store, chúng tôi cam kết mang đến sự hài lòng tuyệt đối. Dưới đây là quy định chi tiết về việc hoàn trả sản phẩm.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
            <AccessTimeIcon color="error" /> 1. Thời gian áp dụng
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Khách hàng có thể gửi yêu cầu đổi/trả hàng trong vòng 7 ngày kể từ lúc đơn hàng cập nhật trạng thái 'Đã giao hàng thành công'." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Quá thời gian này, hệ thống sẽ tự động khóa chức năng hoàn trả." />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
            <GavelIcon color="warning" /> 2. Điều kiện chấp nhận hoàn trả
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><BrokenImageIcon /></ListItemIcon>
              <ListItemText 
                primary="Sản phẩm lỗi do nhà sản xuất" 
                secondary="Sách bị rách, in sai, thiếu trang. Figure bị gãy vỡ, thiếu phụ kiện bên trong hộp (nguyên seal)." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Inventory2Icon /></ListItemIcon>
              <ListItemText 
                primary="Sai sản phẩm" 
                secondary="Giao sai mẫu mã, sai phiên bản so với đơn đặt hàng." 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Inventory2Icon /></ListItemIcon>
              <ListItemText 
                primary="Hư hỏng do vận chuyển" 
                secondary="Hộp bị móp méo nặng ảnh hưởng đến sản phẩm bên trong (Cần có video quay lúc mở hộp - Unboxing)." 
              />
            </ListItem>
          </List>
        </Box>

        <Box mb={4}>
          <Typography variant="h6" fontWeight="bold" color="error">
            3. Trường hợp KHÔNG chấp nhận đổi trả
          </Typography>
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="Khách hàng thay đổi ý định mua hàng (không thích nữa)." />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="Sản phẩm Figure đã bị bóc seal (trừ trường hợp lỗi từ NSX bên trong)." />
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <ListItemText primary="Sản phẩm hư hỏng do lỗi sử dụng của khách hàng." />
            </ListItem>
          </List>
        </Box>

        <Box textAlign="center" mt={5}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/profileUser/refund/request')}
          >
            Đã hiểu, tôi muốn gửi yêu cầu hoàn trả
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}