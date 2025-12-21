import React from 'react'
import { IconSearch } from '@tabler/icons-react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DatePickerWithRange } from './date-picker'
import { useOrderOverviewContext } from "@/context/OrderOverviewContext";

export function FilterNav() {
  // Lấy thêm biến 'status' từ context để biết trạng thái đang chọn là gì
  const { setKeyword, loadOrders, setStatus, status } = useOrderOverviewContext();

  const statusFilter = React.useMemo(
    () => [
      { id: '1', value: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận' },
      { id: '2', value: 'CONFIRMED', label: 'Đã xác nhận' },
      { id: '3', value: 'SHIPPING', label: 'Đang vận chuyển' },
      { id: '4', value: 'DELIVERED', label: 'Đã giao hàng' },
      { id: '5', value: 'CANCELED', label: 'Đã hủy' },
      { id: '6', value: 'PENDING_REFUND', label: 'Chờ hoàn tiền' },
      { id: '7', value: 'APPROVED', label: 'Đã hoàn tiền' },
      { id: '8', value: 'REJECTED', label: 'Từ chối hoàn' },
    ],
    []
  )

  // Hàm xử lý chọn trạng thái: Toggle (Bật/Tắt)
  const handleStatusChange = (value: string) => {
    if (status === value) {
        // Nếu đang chọn trạng thái này mà bấm lại -> Bỏ chọn (set về rỗng hoặc null)
        setStatus('') 
    } else {
        // Nếu chưa chọn -> Chọn trạng thái này
        setStatus(value)
    }
  }

  return (
    <div className='flex items-center py-4'>
      <div className='flex gap-2 items-center'>
        <DatePickerWithRange />

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              Trạng thái <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {statusFilter.map((item) => (
              <DropdownMenuCheckboxItem
                key={item.id}
                className='flex items-center cursor-pointer'
                // Chỉ check nếu status trong context trùng với value của item này
                checked={status === item.value}
                // Gọi hàm toggle khi bấm
                onCheckedChange={() => handleStatusChange(item.value)}
              >
                {/* Hiển thị label tiếng Việt cho đẹp, hoặc dùng item.value nếu muốn hiển thị mã */}
                <span>{item.value}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search input */}
        <div className='relative'>
          <IconSearch
            size={18}
            className='absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground'
          />
          <Input
            placeholder='Tìm theo mã đơn, khách hàng...'
            className='pl-8 w-[260px]'
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Search button */}
        <Button variant='outline' className='gap-1' onClick={loadOrders}>
          <IconSearch size={18} />
          Tìm kiếm
        </Button>
      </div>
    </div>
  )
}