import { useCallback, useEffect, useState } from 'react'
import { OrderDTO } from '@/types/order'
import { getOrders, updateOrderStatus, getQuantityStatus, filterOrder } from '@/api/order'
import { useGetUpdatedOrder } from '@/hooks/useWebsocket'
import { DateRange } from 'react-day-picker'

export function useOrderOverview(initialPage = 0, initialSize = 99) {
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [size, setSize] = useState(initialSize)
  const [totalPage, setTotalPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLastPage, setIsLastPage] = useState(false)
  const [isFirstPage, setIsFirstPage] = useState(false)
  const [date, setDate] = useState<DateRange | undefined>()
  const [listQuantityStatus, setListQuantityStatus] = useState<any[]>([])
  const [keyword, setKeyword] = useState<string>('')
  const [status, setStatus] = useState<string>('');

  const [messageFromBackend, setMessageFromBackend] = useState<string>('');
  useGetUpdatedOrder(setMessageFromBackend);
  // Hàm lấy toàn bộ số lượng của mỗi status hiện có
  const updateStatusOrder = useCallback(async () => {
    const rs = await getQuantityStatus()
    setListQuantityStatus(rs.result)
  }, [messageFromBackend]);
  const loadOrders = async () => {
    setIsLoading(true)
    const fromDate = date?.from
      ? date.from.toISOString().slice(0, 10)
      : null;

    const toDate = date?.to
      ? date?.to.toISOString().slice(0, 10)
      : null;
    const rs = await filterOrder(page, size, keyword, fromDate, toDate, status)
    setOrders(rs.result.content)
    setTotalPage(rs.result.totalPages)
    setTotalElements(rs.result.totalElements)
    setIsLastPage(rs.result.last)
    setIsFirstPage(rs.result.first)
    setIsLoading(false)
  }
  const updateStatus = async (
    orderId: number,
    status:
      | 'PENDING_CONFIRMATION'
      | 'CONFIRMED'
      | 'SHIPPING'
      | 'DELIVERED'
      | 'CANCELED'
  ) => {
    await updateOrderStatus(orderId, status)
    await loadOrders()
    await updateStatusOrder();
  }
  useEffect(() => {
    loadOrders()
  }, [page, size])
  useEffect(() => {
    loadOrders()
  }, [date, keyword, status])
  useEffect(() => {
    updateStatusOrder();
    loadOrders();
  }, [messageFromBackend, updateStatusOrder]);
  return {
    orders,
    isLoading,
    error,
    page,
    size,
    totalPage,
    totalElements,
    isLastPage,
    isFirstPage,
    updateStatus,
    date,
    setDate,
    listQuantityStatus,
    setListQuantityStatus,
    keyword,
    setKeyword,
    loadOrders,
    status,
    setStatus
  }
}
