'use client'

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsers } from '../context/users-context' // Import Context

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  // Lấy state phân trang từ Context
  const { page, setPage, size, setSize, totalPages } = useUsers()

  return (
    <div
      className='flex items-center justify-between overflow-clip px-2'
      style={{ overflowClipMargin: 1 }}
    >
      {/* Phần hiển thị số dòng đã chọn (Vẫn dùng table instance để đếm dòng client-side nếu cần) */}
      <div className='hidden flex-1 text-sm text-muted-foreground sm:block'>
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>

      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        {/* Chọn số lượng dòng mỗi trang (Page Size) */}
        <div className='flex items-center space-x-2'>
          <p className='hidden text-sm font-medium sm:block'>Rows per page</p>
          <Select
            value={`${size}`} // Dùng size từ Context
            onValueChange={(value) => {
              setSize(Number(value)) // Update size vào Context -> Trigger API
              setPage(0) // Reset về trang đầu khi đổi size
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hiển thị số trang hiện tại */}
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          Page {page + 1} of {totalPages}
        </div>

        {/* Nút điều hướng */}
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => setPage(0)} // Về trang đầu
            disabled={page === 0} // Disable nếu đang ở trang 0
          >
            <span className='sr-only'>Go to first page</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => setPage((prev) => Math.max(0, prev - 1))} // Về trang trước
            disabled={page === 0}
          >
            <span className='sr-only'>Go to previous page</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => setPage((prev) => prev + 1)} // Sang trang sau
            disabled={page >= totalPages - 1} // Disable nếu là trang cuối
          >
            <span className='sr-only'>Go to next page</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => setPage(totalPages - 1)} // Về trang cuối
            disabled={page >= totalPages - 1}
          >
            <span className='sr-only'>Go to last page</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}