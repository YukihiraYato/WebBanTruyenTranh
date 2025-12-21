import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { OrderDTO } from '@/types/order'
import { useOrderOverviewContext } from '@/context/OrderOverviewContext'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderActionsCell } from './cells/order-action-cells'
import { CustomerCell } from './cells/order-customer-cells'
import { OrderDateCell } from './cells/order-date-cells'
import { OrderIdCell } from './cells/order-id-cells'
import { PaymentMethodCell } from './cells/order-payment-cells'
import { QuantityCell } from './cells/order-quantity-cells'
import { StatusCell } from './cells/order-status-cells'
import { TotalAmountCell } from './cells/order-total-amount-cells'
import { FilterNav } from './filter-nav'

const STATUS_ORDER: Record<string, number> = {
  "Chờ xác nhận": 1,
  "Đã xác nhận": 2,
  "Đang vận chuyển": 3,
  "Đã chuyển đến": 4,
  "Đã hủy": 5,
}


function parseVNDateTime(dateStr: string): Date {
  // 26-10-2025 11:33:29
  const [date, time] = dateStr.split(' ')
  const [day, month, year] = date.split('-').map(Number)
  const [hour, minute, second] = time.split(':').map(Number)

  return new Date(year, month - 1, day, hour, minute, second)
}
function getColumns(
  navigate: ReturnType<typeof useNavigate>
): ColumnDef<OrderDTO>[] {
  return [
    {
      accessorKey: 'orderId',
      header: 'Mã đơn hàng',
      cell: ({ getValue }) => (
        <OrderIdCell orderId={getValue() as string} />
      ),
    },
    {
      id: 'orderDate',
      header: 'Ngày đặt',
      accessorFn: (row) =>
        parseVNDateTime(
          row.timeFor5StatusOrder.pendingConfirmationDate
        ),
      cell: ({ row }) => (
        <OrderDateCell
          orderDate={
            row.original.timeFor5StatusOrder.pendingConfirmationDate
          }
        />
      ),
    }
    ,
    {
      id: 'customer',
      header: 'Khách hàng',
      accessorFn: (row) => row.customer.username,
      cell: ({ row }) => (
        <CustomerCell
          customerId={row.original.customer.user_id}
          customerName={row.original.customer.username}
        />
      ),
    },
    {
      id: 'totalAmount',
      header: 'Tổng tiền',
      accessorFn: (row) => row.totalAmount, // number
      cell: ({ getValue }) => (
        <TotalAmountCell totalAmount={getValue() as number} />
      ),
    }
    ,
    {
      id: 'paymentMethod',
      header: 'Thanh toán',
      accessorFn: (row) => row.paymentMethodName,
      cell: ({ getValue }) => (
        <PaymentMethodCell paymentMethodName={getValue() as string} />
      ),
    },
    {
      id: 'quantity',
      header: 'Số lượng',
      accessorFn: (row) =>
        row.items.reduce((sum, item) => sum + item.quantity, 0),
      cell: ({ row }) => <QuantityCell items={row.original.items} />,
    }
    ,
    {
      id: 'status',
      header: 'Trạng thái',
      accessorFn: (row) => STATUS_ORDER[row.status] ?? 999,
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <OrderActionsCell
          orderId={row.original.orderId}
          statusCode={row.original.statusCode}
          navigate={navigate}
          customerId={row.original.customer.user_id}
        />
      ),
    },
  ]
}

export function OrderDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const { orders } = useOrderOverviewContext()
  const navigate = useNavigate()
  const columns = getColumns(navigate)
  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className='w-full'>
      <FilterNav />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className='flex cursor-pointer select-none items-center gap-1'
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='text-muted-foreground flex-1 text-sm'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
