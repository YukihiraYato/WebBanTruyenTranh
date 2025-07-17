import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { verifyOtp } from "~/api/user/register";
import "./main.css";
interface VerifyPopupProps {
  open: boolean;
  onClose: () => void;
  onBackToRegister?: () => void;
  onBackToLogin?: () => void; 
  email: string;
 
}
const VerifyPopup: React.FC<VerifyPopupProps> = ({
  open,
  onClose,
  onBackToRegister,
  onBackToLogin,
  email = "",

}) => {
 
  const [codeOTP, setCodeOTP] = useState("");
  const handleChangeOTP = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCodeOTP(event.target.value);
  };
  const verifyOTP = async () => {
    // Gọi API xác minh OTP ở đây
    // Nếu xác minh thành công, thực hiện các hành động cần thiết (ví dụ: chuyển hướng đến trang chính)
    // Nếu xác minh không thành công, hiển thị thông báo lỗi
    const result = (await verifyOtp(email, codeOTP)).result;
    
    if (result === "Xác thực OTP thành công!") {
      alert(result); // Hiển thị thông báo thành công
      onClose(); // Đóng popup xác minh
      if (onBackToLogin) {
        onBackToLogin(); // Quay lại popup đăng ký nếu cần
      }
    } else {
      alert(result); // Hiển thị thông báo lỗi nếu xác minh không thành công
    }

  };
  useEffect(() => {
    if (!open) {
      setCodeOTP(""); // Reset mã OTP khi popup đóng
    }
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle
        textAlign={"center"}
        color="#c92127"
        fontFamily={"sans-serif"}
      >
        Xác minh tài khoản
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2, color: "#333", textAlign: "center" }}>
          Chúng tôi đã gửi mã xác thực (OTP) đến tài khoản email{" "}
          <strong style={{ color: "#c92127" }}>{email}</strong> của bạn. Hãy
          kiểm tra email của bạn.
        </Typography>
        <TextField
          value={codeOTP}
          onChange={handleChangeOTP}
          label="Nhập mã OTP được gửi về email"
          fullWidth
          margin="dense"
        />
        <Button
          variant="contained"
          sx={{ mt: 2, backgroundColor: "#c92127", color: "#fff" }}
          fullWidth
          onClick={verifyOTP}
        >
          Xác minh
        </Button>

        {/* Quay về đăng ký */}
        <Typography
          sx={{ mt: 2, cursor: "pointer", color: "#c92127" }}
          onClick={() => {
            onClose(); // Đóng popup verify trước khi quay lại đăng ký
            if (onBackToRegister) {
              onBackToRegister(); // Mở lại popup đăng ký
            }
          }}
        >
          Quay về đăng ký
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyPopup;
