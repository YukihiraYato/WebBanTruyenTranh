import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import hook điều hướng
import {
    Card,
    Typography,
    TextField,
    Box,
    Button,
    Alert, // Thêm Alert để hiển thị lỗi/thông báo nếu muốn đẹp hơn
} from "@mui/material";
import { changeUserPassword } from "~/api/user/userDetails";
// Nếu bạn có dùng toast (sonner/react-toastify) thì import vào đây để thông báo đẹp hơn

export default function ChangePassword() {
    const navigate = useNavigate(); // 2. Khởi tạo hook
    const [loading, setLoading] = useState(false);
    
    // 3. State lưu trữ dữ liệu form
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Hàm xử lý khi nhập liệu
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Hàm xử lý submit
    const handleSubmit = async () => {
        // 4. Validate cơ bản
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        try {
            setLoading(true);
            
            // 5. Gọi API
            // Lưu ý: Kiểm tra lại API changeUserPassword của bạn nhận tham số dạng object hay từng biến lẻ
            // Ví dụ ở đây mình gửi dạng object hoặc tham số lẻ tùy bạn sửa
            await changeUserPassword(
               formData.newPassword,
              formData.confirmPassword
            );

            alert("Đổi mật khẩu thành công!");
            localStorage.clear(); 
            // 6. Điều hướng về trang chủ
            navigate("/"); 

        } catch (error) {
            console.error(error);
            // Hiển thị lỗi từ server trả về nếu có
            const message = error?.response?.data?.message || "Đổi mật khẩu thất bại, vui lòng thử lại!";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Đổi mật khẩu</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
                <TextField 
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    type="password" 
                    label="Mật khẩu hiện tại*" 
                    placeholder="Mật khẩu hiện tại" 
                    fullWidth 
                    size="small" 
                />
                
                <TextField 
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    type="password" 
                    label="Mật khẩu mới*" 
                    placeholder="Mật khẩu mới" 
                    fullWidth 
                    size="small" 
                />
                
                <TextField 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type="password" 
                    label="Nhập lại mật khẩu mới*" 
                    placeholder="Nhập lại mật khẩu mới" 
                    fullWidth 
                    size="small" 
                />
                
                <Button 
                    variant="contained" 
                    fullWidth 
                    sx={{ bgcolor: '#d70018' }}
                    onClick={handleSubmit} // Gắn sự kiện click
                    disabled={loading}     // Disable nút khi đang gọi API
                >
                    {loading ? "Đang xử lý..." : "Lưu thay đổi"}
                </Button>
            </Box>
        </Card>
    );
};