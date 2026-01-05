import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Button,
  Grid, TextField, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Paper, Pagination, CircularProgress
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import RefundItem from "./RefundItem";
import { OrderDetailsProps } from "../../../../components/Order/OrderDetail";
import { getOrderByStatusDeliverd } from "~/api/user/refund";
import { createRefundRequest } from "../../../../api/user/refund";
import InfoIcon from '@mui/icons-material/Info';

export default function ReturnRequestPage() {
  const [orders, setOrders] = useState<OrderDetailsProps[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  // Thêm loading đợi xử lý yêu cầu hoàn đơn
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;
  // 1. Tạo state để kích hoạt refresh cho con
  const [refreshKey, setRefreshKey] = useState(0);
  const fetchOrders = async (page: number) => {
    try {
      const data = await getOrderByStatusDeliverd("DELIVERED", page, itemsPerPage);
      const mappedOrders = data.content.map((order: any) => ({
        orderId: order.orderId.toString(),
        timeFor5StatusOrder: order.timeFor5StatusOrder,
        nameUser: userDetails.fullName,
        phoneNumber: userDetails.phoneNum,
        address: order.shippingAddress.addressLine1,
        paymentMethod: order.paymentMethodName,
        shipmentMethod: "Giao hàng tận nơi",
        note: "",
        img: order.items[0].img,
        price: order.totalAmount,
        feeShip: 32000,
        status: convertStatus(order.status),
        items: order.items,
      }));

      setOrders(mappedOrders);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Lỗi khi fetch đơn hàng", error);
    }
  };

  const convertStatus = (status: string) => {
    switch (status) {
      case "Chờ xác nhận":
        return "PENDING_CONFIRMATION";
      case "Đã xác nhận":
        return "CONFIRMED";
      case "Đang vận chuyển":
        return "SHIPPING";
      case "Đã chuyển đến":
        return "DELIVERED";
      case "Đã hủy":
        return "CANCELED";
      default:
        return "PENDING_CONFIRMATION";
    }
  };
  useEffect(() => {
    // TODO: Gọi API lấy danh sách đơn hàng đã giao thành công trong 7 ngày
    fetchOrders(0);
  }, []);

  // Xử lý chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);
      // Tạo URL preview
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);

    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenRequest = () => {
    setOpenDialog(true);
    setReason("");
    setImages([]);
    setPreviewUrls([]);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    // 1. Validate
    if (!selectedOrderId || selectedOrderId === "") return;
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do hoàn trả");
      return;
    }
    if (images.length === 0) {
      alert("Vui lòng tải lên ít nhất 1 hình ảnh minh chứng");
      return;
    }

    // 2. Bắt đầu Loading
    setIsSubmitting(true);

    // 3. Chuẩn bị dữ liệu
    const formData = new FormData();
    formData.append("orderId", selectedOrderId);
    formData.append("reason", reason);
    images.forEach((image) => {
      formData.append("image", image);
    });

    console.log("Submitting Return Request...", formData);

    try {
      // 4. Gọi API và ĐỢI (await) kết quả
      const data = await createRefundRequest(formData);

      // 5. Xử lý kết quả sau khi API chạy xong
      if (data.code === 1000) {
        setRefreshKey((prev) => prev + 1);
        await fetchOrders(page);
        alert("Tạo yêu cầu hoàn đơn thành công");

        // CHỈ ĐÓNG DIALOG KHI THÀNH CÔNG
        setOpenDialog(false);
      } else {
        alert(data.message || "Có lỗi xảy ra");
        // Không đóng Dialog để người dùng sửa lại nếu cần
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối đến máy chủ.");
    } finally {
      // 6. Tắt Loading (Dù thành công hay thất bại đều tắt)
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, minWidth: 700, margin: "auto" }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Yêu cầu Hoàn trả / Đổi hàng
      </Typography>

      <Typography variant="h6" mb={2}>Chọn đơn hàng cần hoàn trả:</Typography>

      <Box sx={{ maxHeight: "500px", overflowY: "auto", pr: 1 }}>
        {orders.map((order) => (
          <RefundItem
            key={order.orderId}
            {...order}
            refreshOrders={() => fetchOrders(page)}
            handleOpenRequest={handleOpenRequest}
            setSelectedOrderId={setSelectedOrderId}
            refreshKey={refreshKey}
          />
        ))}
      </Box>

      <Pagination
        count={
          Math.ceil(orders.length / itemsPerPage)
        }
        page={page + 1}
        onChange={(_event, value) => setPage(value - 1)}
        color="primary"
        sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
      />
      {/* DIALOG FORM GỬI YÊU CẦU */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #eee', bgcolor: '#f9f9f9' }}>
          {`Yêu cầu hoàn trả / đổi hàng - Đơn hàng #${selectedOrderId}`}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>

          <Typography fontWeight="bold" gutterBottom>1. Nội dung yêu cầu (*):</Typography>

          {/* PHẦN HƯỚNG DẪN NGƯỜI DÙNG */}
          <Box bgcolor="#e3f2fd" p={2} borderRadius={1} mb={2} display="flex" gap={1} alignItems="flex-start">
            <InfoIcon color="info" fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" color="text.secondary">
              Để được hỗ trợ nhanh nhất, vui lòng ghi rõ:<br />
              • <b>Tên sản phẩm & Số lượng</b> cần trả.<br />
              • <b>Lý do</b> (Hư hỏng, sai mẫu, lỗi NSX...).<br />
              • <b>Mong muốn hoàn trả</b> (Hoàn điểm WB / Chuyển khoản / Đổi mới).
            </Typography>
          </Box>

          <TextField
            multiline
            rows={5}
            fullWidth
            placeholder={`- Sản phẩm: Mô hình Gundam HG (x1)\n- Lý do: Hộp bị móp nặng do vận chuyển, kiếm bên trong bị gãy.\n- Mong muốn: Đổi sản phẩm mới nguyên seal.`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography fontWeight="bold" gutterBottom>2. Hình ảnh minh chứng (*):</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Vui lòng chụp rõ chỗ hư hỏng, mã vận đơn dán trên hộp và tình trạng bao bì.
          </Typography>

          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Tải ảnh lên
            <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
          </Button>

          {/* Preview Ảnh */}
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {previewUrls.map((url, index) => (
              <Box key={index} position="relative" width={100} height={100} border="1px solid #ddd" borderRadius={2} overflow="hidden">
                <img
                  src={url}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute", top: 2, right: 2,
                    bgcolor: "rgba(255,255,255,0.9)",
                    '&:hover': { bgcolor: '#ffebee' }
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <DeleteIcon color="error" fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          <Button
            disabled={isSubmitting}
            onClick={() => setOpenDialog(false)} color="inherit" variant="outlined" sx={{ textTransform: 'none' }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={isSubmitting} // Disable nút để tránh spam click
            sx={{ px: 4, textTransform: 'none', minWidth: '140px' }} // minWidth để nút không bị co lại khi hiện loading
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}