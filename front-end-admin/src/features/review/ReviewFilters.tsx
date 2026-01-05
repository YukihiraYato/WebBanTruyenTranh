import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewSearchParams, ReviewType } from '../../types/review';

interface ReviewFiltersProps {
  params: ReviewSearchParams;
  setParams: React.Dispatch<React.SetStateAction<ReviewSearchParams>>;
}

export function ReviewFilters({ params, setParams }: ReviewFiltersProps) {
  // Hàm helper để update params và reset về trang 0 khi filter thay đổi
  const updateFilter = (key: keyof ReviewSearchParams, value: any) => {
    setParams((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-background rounded-lg border">
      {/* Tìm kiếm từ khóa */}
      <div className="flex-1 min-w-[250px]">
        <Input
          placeholder="Tìm theo User, Tên Sách..."
          value={params.keyword || ''}
          onChange={(e) => updateFilter('keyword', e.target.value)}
          className="h-10"
        />
      </div>

      {/* Lọc theo Loại */}
      <div className="w-[180px]">
        <Select
          value={params.type || 'ALL'}
          onValueChange={(val) => updateFilter('type', val === 'ALL' ? '' : val)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Loại sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả loại</SelectItem>
            <SelectItem value={ReviewType.BOOK}>Sách</SelectItem>
            <SelectItem value={ReviewType.COLLECTION}>Bộ sưu tập</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lọc theo Rating */}
      <div className="w-[200px]">
        <Select
          value={params.minRating?.toString() || 'ALL'}
          onValueChange={(val) => updateFilter('minRating', val === 'ALL' ? '' : parseInt(val))}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Lọc theo sao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả sao</SelectItem>
            <SelectItem value="1">1 sao trở lên</SelectItem>
            <SelectItem value="2">2 sao trở lên</SelectItem>
            <SelectItem value="3">3 sao trở lên</SelectItem>
            <SelectItem value="4">4 sao trở lên</SelectItem>
            <SelectItem value="5">Chỉ 5 sao</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}