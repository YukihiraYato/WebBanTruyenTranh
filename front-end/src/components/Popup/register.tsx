import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import CachedIcon from '@mui/icons-material/Cached';
import "./main.css";
interface RegisterPopupProps {
  open: boolean;
  onClose: () => void;
  onRegisterSuccess?: (username: string, password: string, fullName: string, phoneNum: string, email: string, dateOfBirth: string) => void;
  isLoading?: boolean;
}


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPopup: React.FC<RegisterPopupProps> = ({ open, onClose, onRegisterSuccess, isLoading }) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState<string>('');
  const [accountInfo, setAccountInfo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isValidAccount, setIsValidAccount] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const loginRegisterRef = useRef<HTMLButtonElement | null>(null);
  const forgotPasswordButtonRef = useRef<HTMLButtonElement | null>(null);
  const { t } = useTranslation();
  // Cập nhập lại data account khi người dùng nhập và reset lỗi
  const handleChangeAccount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccountInfo(event.target.value);
    setError(""); // Reset lỗi khi nhập
  };
  const handleChangeFullName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(event.target.value);
    setError(""); // Reset lỗi khi nhập
  };
  const handleChangePhone = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);
    setError(""); // Reset lỗi khi nhập
  };
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    setError(""); // Reset lỗi khi nhập
  };
  const handleChangeDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
    setError(""); // Reset lỗi khi nhập
  };
  //  Kiểm tra account khi người dùng rời khỏi input
  const handleBlurAccount = () => {
    if (!accountInfo) {
      setError("Trường này không được để trống!");
      setIsValidAccount(false);
      return;
    }
    // if (emailRegex.test(accountInfo)) {
    //     setError("");
    //     setIsValidAccount(true);
    //   } else {
    //     setError("Vui lòng nhập email hợp lệ!");
    //     setIsValidAccount(false);
    //   }
    setIsValidAccount(true);
    setIsValidPassword(true);
  };
  //  Kiểm tra password khi rời khỏi input
  const handleBlurPassword = () => {
    if (!password) {
      setPasswordError("Mật khẩu không được để trống!");
      setIsValidPassword(false);
    } else {
      setPasswordError("");
      setIsValidPassword(true);
    }
  };
  // Cập nhập lại data password khi người dùng nhập và reset lỗi
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordError("");
    setPassword(event.target.value);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // Reset dữ liệu khi đóng popup
  useEffect(() => {
    if (!open) {
      setFullName("");
      setPhone("");
      setEmail("");
      setShowPassword(false);
      setAccountInfo("");
      setPassword("");
      setError("");
      setPasswordError("");
      setIsValidAccount(false);
      setIsValidPassword(false);
    }
  }, [open]);
  // Bật/tắt nút login khi account và password hợp lệ
  useEffect(() => {
    if (loginRegisterRef.current) {
      loginRegisterRef.current.disabled = !(isValidAccount && isValidPassword);
    }
    if (forgotPasswordButtonRef.current) {
      forgotPasswordButtonRef.current.disabled = !isValidAccount;
    }
  }, [isValidAccount, isValidPassword]);

const formatDateToDDMMYYYY = (inputDate: string) => {
  const [year, month, day] = inputDate.split("-");
  return `${day}-${month}-${year}`;
};

  // Xử lý đăng ký tài khoản
  const handleProccessRegister = () => {
    // Trường hợp email đã tồn tại
    //  Trường hợp đăng ký thành công và chuyển sang verify bằng mã otp
    console.log("Đăng ký thành công!");

    // Nếu có onRegisterSuccess, gọi nó để mở popup xác minh tài khoản
    if (onRegisterSuccess) {
      onRegisterSuccess(accountInfo, password, fullName, phone, email, formatDateToDDMMYYYY(date));
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        textAlign={"center"}
        color="#c92127"
        fontFamily={"sans-serif"}
      >
        {t("navbar.buttonLogin.register.label")}
      </DialogTitle>
      <DialogContent>

        <Box>
          <TextField
            fullWidth
            label="Họ và tên"
            placeholder="Nhập họ và tên của bạn"
            margin="dense"
            variant="outlined"
            value={fullName}
            onChange={handleChangeFullName}
            // onBlur={}
            error={!!error}
            helperText={error}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            placeholder="Nhập số điện thoại của bạn"
            margin="dense"
            variant="outlined"
            value={phone}
            onChange={handleChangePhone}
            // onBlur={}
            error={!!error}
            helperText={error}
          />
          <TextField
            fullWidth
            label="Email"
            placeholder="Nhập email của bạn"
            margin="dense"
            variant="outlined"
            value={email}
            onChange={handleChangeEmail}
            // onBlur={handleBlurAccount}
            error={!!error}
            helperText={error}
          />
          <TextField
            fullWidth
            type="date"
            label="Ngày sinh"
            placeholder="Nhập ngày sinh của bạn"
            margin="dense"
            variant="outlined"
            value={date}
            onChange={handleChangeDate}
            InputLabelProps={{
              shrink: true, // để label không bị đè lên input date
            }}
            // onBlur={handleBlurAccount}
            error={!!error}
            helperText={error}
          />
          <TextField
            fullWidth
            label="Username"
            placeholder="Nhập tên tài khoản của bạn"
            margin="dense"
            variant="outlined"
            value={accountInfo}
            onChange={handleChangeAccount}
            onBlur={handleBlurAccount}
            error={!!error}
            helperText={error}
          />
          <TextField
            margin="dense"
            value={password}
            onChange={handleChangePassword}
            onBlur={handleBlurPassword}
            type={showPassword ? "text" : "password"}
            error={!!passwordError}
            helperText={passwordError}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                      }
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            fullWidth
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, backgroundColor: "#c92127", color: "#fff" }}
            onClick={handleProccessRegister}
            disabled={!isValidAccount || !isValidPassword} //  Vô hiệu hóa nếu tài khoản chưa hợp lệ
          >
            {isLoading ? <CachedIcon
              sx={{
                '@keyframes spin': {
                  to: { transform: 'rotate(360deg)' },
                },
                animation: 'spin 1s linear infinite',
              }}
            />
              : t("navbar.buttonLogin.register.label")}
          </Button>
        </Box>



      </DialogContent>
    </Dialog>
  );
};

export default RegisterPopup;
