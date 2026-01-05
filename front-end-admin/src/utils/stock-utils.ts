
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'; // Badge variant: secondary/outline
    case 'COMPLETED': return 'bg-green-100 text-green-800 hover:bg-green-200'; // Badge variant: success
    case 'CANCELLED': return 'bg-red-100 text-red-800 hover:bg-red-200'; // Badge variant: destructive
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string) => {
   switch (status) {
    case 'PENDING': return 'Chờ duyệt';
    case 'COMPLETED': return 'Đã nhập kho';
    case 'CANCELLED': return 'Đã hủy';
    default: return status;
  }
}