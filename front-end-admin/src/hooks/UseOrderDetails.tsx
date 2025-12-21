import { useEffect, useState, useCallback } from 'react'
import { useParams } from '@tanstack/react-router'
import { OrderDTO, OrderTimeline } from '@/types/order'
import { getOrderById, getOrderTimeline } from '@/api/order'
import {getRefundRequestsByOrderId} from '@/api/refund'
import {OrderItemResponseDTO} from '@/features/orders/details/components/refund-item'
import {handleRefundRequest} from '@/api/refund'
import {toast} from 'sonner'
import { al } from 'node_modules/@faker-js/faker/dist/airline-BUL6NtOJ'
export interface RefundItemsResponseDTO {
  message: string;
  status: string;
  images: string[];
  createdAt: string; // dạng chuỗi yyyy-MM-dd HH:mm:ss
  orderResponseDTO: {
    orderId: number;
    items: OrderItemResponseDTO[];
  };
}
export function useOrderDetails() {
  const [order, setOrder] = useState<OrderDTO | null>(null)
  const { id } = useParams({ from: '/_authenticated/orders/$id/details' })
  const [timeline, setTimeline] = useState<OrderTimeline | null>(null)
  const [refundRequests, setRefundRequests] = useState<RefundItemsResponseDTO | null>(null);
    const fetchRefundRequests = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getRefundRequestsByOrderId(Number(id));
      setRefundRequests(res);
   
    } catch (error) {
      console.error("Failed to fetch refund requests", error);
    }
  }, [id]);

  const processReturn = async (
     status: string,
    adminNote: string,
    refundMethod: string,
    orderId: number,
    isRestock: boolean,
    selectedItems: { itemId: number; quantity: number; type: string; finalPrice: number }[]
  ) => {
    
    // Validate
    if (!adminNote.trim()) {
      toast.error("Vui lòng nhập lý do ! ",{
        duration: 2000
      });
      return;
    }

    try {
      // Gọi API Backend
      // Lưu ý: Đảm bảo payload khớp với API của bạn
      const data = await handleRefundRequest({
        status: status,
        adminNote: adminNote,
        typeRefundMethod: refundMethod,
        orderId: orderId,
        isRestock: isRestock,
        selectedItems: selectedItems
      });

      // Thông báo thành công
      if(data.code === 1000){
         toast.success(
        data.result.status === "APPROVED"
          ? "Đã chấp nhận yêu cầu hoàn tiền"
          : "Đã từ chối yêu cầu"
      ,{
        duration: 2000
      });
      await fetchRefundRequests();
      }else {
         toast.error("Có lỗi xảy ra, vui lòng thử lại.",{
          duration: 2000
         });
      }

      
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      throw error; 
    }
  };
  useEffect(() => {
    const loadOrder = async () => {
      const dto = await getOrderById(Number(id))
      const tl = await getOrderTimeline(Number(id))
      setOrder(dto.result)
      setTimeline(tl.result)
    }
    loadOrder()  
    fetchRefundRequests();
  }, [id,fetchRefundRequests])
  return {
    order,
    timeline,
    refundRequests,
    id,
    processReturn,
   
  }
}
