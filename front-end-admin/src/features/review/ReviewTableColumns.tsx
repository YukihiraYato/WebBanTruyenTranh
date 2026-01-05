import { ColumnDef, Table } from '@tanstack/react-table'; // Import thêm Table type
import { Review, ReviewType } from '../../types/review';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Star, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteReview } from '@/api/review'; // Import hàm API trực tiếp
import { format } from 'date-fns';
import { useState } from 'react';
import { ViewReviewDialog } from './ViewReviewDialog';
import { toast } from 'sonner';

// Component hiển thị nút hành động
// Nhận thêm prop 'table' để gọi hàm refresh từ meta
const ReviewActionsCell = ({ review, table }: { review: Review, table: Table<Review> }) => {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Bạn chắc chắn muốn xóa review ID: ${review.reviewId}?`)) {
      setIsDeleting(true);
      try {
        // 1. Gọi API xóa
        await deleteReview(review.reviewId);
        toast.success("Đã xóa đánh giá thành công");
        
        // 2. Gọi hàm refreshData đã định nghĩa ở file cha (ReviewsPage)
        table.options.meta?.refreshData();
      } catch (error) {
        console.error(error);
        toast.error("Xóa thất bại. Vui lòng thử lại.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete} 
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <Trash2 className="mr-2 h-4 w-4" /> 
            {isDeleting ? 'Đang xóa...' : 'Xóa review'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ViewReviewDialog open={showViewDialog} onOpenChange={setShowViewDialog} review={review} />
    </>
  );
};

export const reviewTableColumns: ColumnDef<Review>[] = [
  {
    accessorKey: 'reviewId',
    header: 'ID',
    cell: ({ row }) => <div className="w-[50px]">#{row.getValue('reviewId')}</div>,
  },
  {
    accessorKey: 'targetName',
    header: 'Sản phẩm',
    cell: ({ row }) => {
      const type = row.original.targetType;
      return (
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[200px]" title={row.getValue('targetName')}>
            {row.getValue('targetName')}
          </span>
          <span className="text-xs text-muted-foreground">
             <Badge variant={type === 'BOOK' ? 'default' : 'secondary'} className="mt-1">
               {type}
             </Badge>
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'userName',
    header: 'Người dùng',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row.getValue('userName')}</span>
        <span className="text-xs text-muted-foreground">{row.original.userEmail}</span>
      </div>
    ),
  },
  {
    accessorKey: 'rating',
    header: 'Đánh giá',
    cell: ({ row }) => {
      const rating = parseFloat(row.getValue('rating'));
      return (
        <div className="flex items-center">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
          <span className="font-bold">{rating.toFixed(1)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'reviewText',
    header: 'Nội dung',
    cell: ({ row }) => (
      <div className="truncate max-w-[300px] italic text-muted-foreground" title={row.getValue('reviewText')}>
        "{row.getValue('reviewText')}"
      </div>
    ),
  },
  {
    accessorKey: 'reviewDate',
    header: 'Ngày đăng',
    cell: ({ row }) => format(new Date(row.getValue('reviewDate')), 'dd/MM/yyyy'),
  },
  {
    id: 'actions',
    // Sửa chỗ này: Truyền table context vào component
    cell: ({ row, table }) => <ReviewActionsCell review={row.original} table={table} />,
  },
];