import { useState, useEffect, useCallback } from 'react';
import { useReactTable, getCoreRowModel, flexRender, RowData } from '@tanstack/react-table';

// Các component UI
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner'; // Hoặc library toast bạn đang dùng

// Import API
import { getAllReviews } from '@/api/review'; // Hàm gọi API raw (trả về Promise)
import { ReviewSearchParams, PaginatedResponse, Review } from '../../types/review';
import { reviewTableColumns } from './ReviewTableColumns';
import { ReviewFilters } from './ReviewFilters';

// --- QUAN TRỌNG: Định nghĩa kiểu cho meta để TypeScript không báo lỗi ---
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    refreshData: () => void;
  }
}

export default function ReviewsPage() {
  // 1. State quản lý dữ liệu và loading thủ công
  const [data, setData] = useState<PaginatedResponse<Review> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // State params
  const [searchParams, setSearchParams] = useState<ReviewSearchParams>({
    page: 0,
    size: 10,
    keyword: '',
    type: '',
    minRating: '',
  });

  // 2. Hàm gọi API lấy dữ liệu
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await getAllReviews(searchParams.page || 0, searchParams.size || 10, searchParams.keyword || '', searchParams.type || '', searchParams.minRating || '', searchParams.fromDate || '', searchParams.toDate || '');
      setData(result.result);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setIsError(true);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // 3. useEffect: Gọi lại API khi searchParams thay đổi
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 4. Cấu hình Table
  const table = useReactTable({
    data: data?.content || [],
    columns: reviewTableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages || -1,
    state: {
      pagination: {
        pageIndex: searchParams.page || 0,
        pageSize: searchParams.size || 10,
      },
    },
    // --- KEY: Truyền hàm refresh xuống cho các cột con sử dụng ---
    meta: {
      refreshData: fetchData,
    },
    onPaginationChange: (updater) => {
        if (typeof updater === 'function') {
           const newPaginationState = updater({
               pageIndex: searchParams.page || 0,
               pageSize: searchParams.size || 10
           });
           setSearchParams(prev => ({
               ...prev, 
               page: newPaginationState.pageIndex, 
               size: newPaginationState.pageSize
           }));
        }
    }
  });

  return (
    <div className="h-full flex-1 flex-col space-y-4 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Đánh giá</h2>
          <p className="text-muted-foreground">Kiểm duyệt và quản lý phản hồi từ người dùng.</p>
        </div>
      </div>

      <ReviewFilters params={searchParams} setParams={setSearchParams} />

      <div className="rounded-md border relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 5 }).map((_, index) => (
                 <TableRow key={index}>
                   {reviewTableColumns.map((col, colIndex) => (
                     <TableCell key={colIndex}><Skeleton className="h-6 w-full" /></TableCell>
                   ))}
                 </TableRow>
               ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={reviewTableColumns.length} className="h-24 text-center text-red-500">
                  Có lỗi xảy ra khi tải dữ liệu.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={reviewTableColumns.length} className="h-24 text-center">
                  Không tìm thấy đánh giá nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Phân trang */}
      {data && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Tổng cộng {data.totalElements} kết quả. Trang {data.number + 1} trên {data.totalPages}.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams((prev) => ({ ...prev, page: Math.max(0, (prev.page || 0) - 1) }))}
              disabled={data.number === 0 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchParams((prev) => ({ ...prev, page: (prev.page || 0) + 1 }))}
              disabled={data.number + 1 >= data.totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}