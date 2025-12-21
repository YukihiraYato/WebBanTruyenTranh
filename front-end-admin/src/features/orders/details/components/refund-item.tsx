import { useState, useEffect } from "react";
import {
  Reply,
  Info,
  CheckCircle,
  XCircle,
  CreditCard,
  Coins,
  ArchiveRestore,
  ChevronLeft,
  Package,
  User,
  MapPin,
  Calendar,
  CheckSquare,
  Square,
  ArrowRightLeft,
  RefreshCw // Icon cho đổi trả
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useOrderDetailsContext } from '@/context/OrderDetailsContext'
import { set } from "date-fns";
import { Loader2 } from "lucide-react";
//UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
//  TYPE DEFINITIONS ---
export enum EReturnStatus {
  PENDING_REFUND = "PENDING_REFUND",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED_REFUND = "COMPLETED_REFUND"
}
export interface OrderItemResponseDTO {
  productId: number;
  bookTitle: string;
  quantity: number;
  finalPrice: number;
  img: string;
  type: string;
}

export type RefundMethodType = "PAYPAL" | "WB_POINT" | "GET_NEW";



interface ReturnRequestData {
  message: string;
  images: string[];
  status: EReturnStatus;
  createdAt: string;
  orderResponseDTO: {
    orderId: number;
    items: OrderItemResponseDTO[];
  };

}



// --- 2. COMPONENT ---

export default function AdminReturnSection() {
  const { refundRequests, id, processReturn } = useOrderDetailsContext();
  const [adminNote, setAdminNote] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [refundMethod, setRefundMethod] = useState<string>("PAYPAL");
  const [isRestock, setIsRestock] = useState(false);
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);


  if (!refundRequests) return null;

  const isPending = refundRequests.status === EReturnStatus.PENDING_REFUND;
  // Tính tổng tiền đang được chọn (Chỉ dùng khi Pending để Admin xem trước)
  const calculateSelectedTotal = () => {
    return refundRequests?.orderResponseDTO.items.reduce((total, item) => {
      const qty = selectedItemsMap[item.productId] || 0;
      return total + (item.finalPrice * qty);
    }, 0);
  };
  // Tính tổng giá trị thực của đơn hàng (Dùng khi đã duyệt xong để hiển thị tham chiếu)
  const calculateOrderTotal = () => {
    return refundRequests?.orderResponseDTO.items.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
  };
  const displayTotal = isPending ? calculateSelectedTotal() : calculateOrderTotal();

  // Helper render trạng thái
  const handleToggleItem = (item: OrderItemResponseDTO) => {
    setSelectedItemsMap(prev => {
      const newMap = { ...prev };
      if (newMap[item.productId]) delete newMap[item.productId];
      else newMap[item.productId] = item.quantity; // Mặc định chọn max số lượng
      return newMap;
    });
  };

  const handleChangeQuantity = (itemId: number, newQty: number, maxQty: number) => {
    if (newQty < 1 || newQty > maxQty) return;
    setSelectedItemsMap(prev => ({ ...prev, [itemId]: newQty }));
  };

  const handleProcessClick = async(status: EReturnStatus) => {
    // Lấy danh sách item đã chọn và map thêm TYPE vào
    const itemsToReturn = Object.entries(selectedItemsMap).map(([id, qty]) => {
        // Tìm item gốc trong danh sách returnData.items để lấy type
        const originalItem = refundRequests?.orderResponseDTO.items.find(item => item.productId === Number(id));
        return {
            itemId: Number(id),
            quantity: qty,
            type: originalItem?.type || "BOOK" ,// Fallback nếu không tìm thấy (thường sẽ luôn tìm thấy),
            finalPrice: originalItem?.finalPrice || 0
        };
    });

    // Validate: Nếu duyệt hoàn tiền thì phải chọn ít nhất 1 món
    if (status === EReturnStatus.APPROVED && itemsToReturn.length === 0) {
        alert("Vui lòng tích chọn ít nhất 1 sản phẩm để hoàn trả!");
        return;
    }
    setIsLoading(true);
  try {
     await processReturn(
        status, 
        adminNote, 
        refundMethod, 
        parseInt(id), 
        isRestock, 
        itemsToReturn // Gửi list này (đã có type) về BE xử lý
    );
  }finally{
    setIsLoading(false);
  }
}

  const getStatusConfig = (status: EReturnStatus) => {
    switch (status) {
      case EReturnStatus.PENDING_REFUND:
        return {
          label: "Yêu cầu mới - Chờ xử lý",
          classes: "bg-orange-100 text-orange-700 border-orange-200",
          icon: <Info className="w-4 h-4 mr-1" />
        };
      case EReturnStatus.APPROVED:
        return {
          label: "Đã chấp nhận hoàn tiền",
          classes: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle className="w-4 h-4 mr-1" />
        };
      case EReturnStatus.REJECTED:
        return {
          label: "Đã từ chối",
          classes: "bg-red-100 text-red-700 border-red-200",
          icon: <XCircle className="w-4 h-4 mr-1" />
        };
      default:
        return {
          label: status,
          classes: "bg-gray-100 text-gray-700 border-gray-200",
          icon: null
        };
    }
  };

  const statusConfig = getStatusConfig((refundRequests.status as EReturnStatus));



  return (
    <div className={cn("mb-6 rounded-lg border overflow-hidden transition-all bg-white", isPending ? "border-orange-300 shadow-md" : "border-gray-200 shadow-sm")}>
      {/* Header */}
      <div className={cn("px-6 py-4 border-b flex justify-between items-center", isPending ? "bg-orange-50/50 border-orange-100" : "bg-gray-50/50")}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full", isPending ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500")}>
            <Reply className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Yêu cầu Trả hàng / Hoàn tiền</h3>
            <p className="text-sm text-gray-500">Ngày gửi yêu cầu: {refundRequests.createdAt}</p>
          </div>
        </div>
        <div className={cn("flex items-center px-3 py-1 rounded-full border text-sm font-medium", statusConfig.classes)}>
          {statusConfig.icon}{statusConfig.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* CỘT TRÁI: THÔNG TIN CHI TIẾT & CHỌN SẢN PHẨM */}
        <div className="lg:col-span-7 space-y-6">

          {/* Danh sách sản phẩm (Lấy từ items trong đơn) */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex justify-between">
              <span>Sản phẩm trong đơn hàng</span>
              {isPending && <span className="text-orange-600 italic normal-case font-normal">(Vui lòng tích chọn sản phẩm cần hoàn)</span>}
            </h4>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {refundRequests.orderResponseDTO.items.map((item) => {
                const isSelected = !!selectedItemsMap[item.productId];
                const selectedQty = selectedItemsMap[item.productId] || 0;

                return (
                  <div key={item.productId} className={cn("p-4 flex items-center gap-4 border-b last:border-0 transition-colors", isSelected && isPending ? "bg-blue-50/50" : "hover:bg-gray-50")}>

                    {/* Checkbox (Chỉ hiện khi Pending để Admin chọn) */}
                    {isPending && (
                      <div className="cursor-pointer text-gray-400 hover:text-blue-600" onClick={() => handleToggleItem(item)}>
                        {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                      </div>
                    )}

                    <img src={item.img} alt={item.bookTitle} className="w-12 h-12 rounded border bg-gray-50 object-cover" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.type === "BOOK" ?
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">BOOK</span> :
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">REDEEM</span>
                        }
                        <p className="text-sm font-medium text-gray-900 truncate" title={item.bookTitle}>{item.bookTitle}</p>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Đơn giá: {item.finalPrice.toLocaleString()} đ</div>
                    </div>

                    {/* Nút tăng giảm số lượng (Chỉ hiện khi Pending và đã Check) */}
                    {isPending && isSelected ? (
                      <div className="flex items-center border rounded bg-white h-8">
                        <button className="px-2 hover:bg-gray-100 text-gray-600 h-full" onClick={() => handleChangeQuantity(item.productId, selectedQty - 1, item.quantity)}>-</button>
                        <span className="px-2 text-sm font-bold w-8 text-center">{selectedQty}</span>
                        <button className="px-2 hover:bg-gray-100 text-gray-600 h-full" onClick={() => handleChangeQuantity(item.productId, selectedQty + 1, item.quantity)}>+</button>
                      </div>
                    ) : (
                      // Khi đã duyệt xong hoặc chưa chọn, hiện số lượng gốc của đơn hàng
                      <div className="text-sm font-bold text-gray-700">x{item.quantity}</div>
                    )}

                    <div className="text-sm font-bold text-gray-900 w-24 text-right">
                      {(isPending ? (item.finalPrice * (selectedItemsMap[item.productId] || 0)) : (item.finalPrice * item.quantity)).toLocaleString()} đ
                    </div>
                  </div>
                );
              })}

              {/* Footer Tổng Tiền */}
              <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  {isPending ? "Dự kiến hoàn:" : "Tổng giá trị đơn hàng:"}
                </span>
                <span className="text-xl font-bold text-red-600">{displayTotal.toLocaleString()} đ</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Lý do & Nguyện vọng</h4>
              <div className="bg-blue-50 text-blue-900 p-3 rounded-lg border border-blue-100 italic text-sm">
                "{refundRequests.message}"
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Minh chứng</h4>
              <div className="flex gap-2">
                {refundRequests.images.map((img, idx) => (
                  <img key={idx} src={img} className="w-16 h-16 rounded border cursor-pointer hover:opacity-80 object-cover" onClick={() => setPreviewImage(img)} />
                ))}
                {refundRequests.images.length === 0 && <div className="text-sm text-gray-400 italic">Không có ảnh</div>}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: XỬ LÝ */}
        <div className="lg:col-span-5 flex flex-col h-full pl-0 lg:pl-8 lg:border-l border-gray-100">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Xử lý yêu cầu</h4>

          {isPending ? (
            <div className="flex-1 flex flex-col space-y-6">

              {/* Phương thức hoàn trả */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức hoàn trả</label>
                <div className="flex flex-wrap gap-3">
                  {["PAYPAL", "WB_POINT", "GET_NEW"].map((method) => (
                    <label key={method} className={cn(
                      "flex items-center gap-2 cursor-pointer border px-3 py-2 rounded transition-colors",
                      refundMethod === method ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" : "hover:bg-gray-50 border-gray-200"
                    )}>
                      <input
                        type="radio"
                        name="returnMethod"
                        value={method}
                        checked={refundMethod === method}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-medium">
                        {method === "PAYPAL" && "PayPal"}
                        {method === "WB_POINT" && "WB Point"}
                        {method === "GET_NEW" && "Gửi Mới"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Checkbox Restock */}
              <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <input type="checkbox" id="restock" className="w-4 h-4 cursor-pointer" checked={isRestock} onChange={(e) => setIsRestock(e.target.checked)} />
                <label htmlFor="restock" className="text-sm text-gray-700 cursor-pointer flex items-center gap-2 select-none">
                  <ArchiveRestore className="w-4 h-4 text-gray-500" /> Nhập kho lại sản phẩm đã chọn?
                </label>
              </div>

              {/* Ghi chú */}
              <div className="flex flex-col flex-1 mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú xử lý</label>
                <textarea
                  className="w-full flex-1 min-h-[80px] p-3 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Nhập nội dung phản hồi..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-white text-red-700 border border-red-200 font-medium hover:bg-red-50 transition-colors" onClick={() => handleProcessClick(EReturnStatus.REJECTED)}>
                  <XCircle className="w-4 h-4" /> Từ chối
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 shadow-sm transition-colors"
                  onClick={() => handleProcessClick(EReturnStatus.APPROVED)}
                >
                  <CheckCircle className="w-4 h-4" /> Chấp nhận
                </button>
              </div>
            </div>
          ) : (
            <div className={cn("flex-1 rounded-xl p-6 flex flex-col items-center justify-center text-center border", refundRequests.status === EReturnStatus.APPROVED ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100")}>
              {refundRequests.status === EReturnStatus.APPROVED ? <CheckCircle className="w-16 h-16 text-green-500 mb-4" /> : <XCircle className="w-16 h-16 text-red-500 mb-4" />}
              <h5 className={cn("text-lg font-bold mb-2", refundRequests.status === EReturnStatus.APPROVED ? "text-green-800" : "text-red-800")}>
                {refundRequests.status === EReturnStatus.APPROVED ? "Đã hoàn tiền thành công" : "Đã từ chối yêu cầu"}
              </h5>
             
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setPreviewImage(null)}><img src={previewImage} className="max-w-full max-h-[90vh] rounded shadow-2xl" /><button className="absolute top-4 right-4 text-white"><XCircle className="w-8 h-8" /></button></div>}
      {isLoading && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"><Loader2 className="w-12 h-12 text-white animate-spin" /></div>}
    </div>
     
  );
}

