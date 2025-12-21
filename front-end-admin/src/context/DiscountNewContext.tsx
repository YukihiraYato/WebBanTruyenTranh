import { createContext, useContext, ReactNode } from 'react'
import { useDiscountNew } from '@/hooks/UseDiscountNew'
import { useEffect } from 'react'
import { createDiscount } from '@/api/discount'
import { toast } from 'sonner';
interface DiscountNewContextType {
  code: string;
  setCode: (code: string) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  discountType: string; // or enum, depending on your use case
  setDiscountType: (discountType: string) => void;
  value: string; // or string, depending on your use case
  setValue: (value: string) => void;
  targetType: string; // or enum, depending on your use case
  setTargetType: (targetType: string) => void;
  minOrderAmount: number;
  setMinOrderAmount: (minOrderAmount: number) => void;
  usageLimit: number;
  setUsageLimit: (usageLimit: number) => void;
  useCount: number;
  setUseCount: (useCount: number) => void;
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
  startDate: string;
  setStartDate: (startDate: string) => void;
  endDate: string;
  setEndDate: (endDate: string) => void;
  handleCreateDiscount: () => void; // add this property
  categoryIds: number[];
  setCategoryIds: (categoryIds: number[]) => void;
  userRank: string;
  setUserRank: (userRank: string) => void;
  usageLimitPerUser: number;
  setUsageLimitPerUser: (limit: number) => void;
  pointCost: number;
  setPointCost: (pointCost: number) => void;
}
const DiscountNewContext = createContext<DiscountNewContextType>({
  code: '',
  setCode: () => { },
  title: '',
  setTitle: () => { },
  description: '',
  setDescription: () => { },
  discountType: 'PERCENT',
  setDiscountType: () => { },
  value: "0",
  setValue: () => { },
  targetType: 'ORDER',
  setTargetType: () => { },
  minOrderAmount: 0,
  setMinOrderAmount: () => { },
  usageLimit: -1,
  setUsageLimit: () => { },
  useCount: -1,
  setUseCount: () => { },
  isActive: true,
  setIsActive: () => { },
  startDate: '',
  setStartDate: () => { },
  endDate: '',
  setEndDate: () => { },
  handleCreateDiscount: () => { },
  categoryIds: [],
  setCategoryIds: () => { },
  userRank: '',
  setUserRank: () => { },
  usageLimitPerUser: -1,
  setUsageLimitPerUser: () => { },
  pointCost: 0,
  setPointCost: () => { },
})
export const useDiscountNewContext = () => useContext(DiscountNewContext)
export const DiscountNewProvider = ({ children }: { children: ReactNode }) => {
  const value = useDiscountNew()

  // Reset the form when the provider mounts
  // useEffect(() => {

  // }, [value])
  const handleCreateDiscount = async () => {
    // ---  VALIDATION (KIỂM TRA DỮ LIỆU) ---

    // 1. Kiểm tra các trường bắt buộc cơ bản (Không được null hoặc rỗng)
    if (!value.code?.trim()) {
      toast.error('Lỗi tạo Discount', { description: 'Vui lòng nhập Mã giảm giá (Code).' });
      return;
    }
    if (!value.title?.trim()) {
      toast.error('Lỗi tạo Discount', { description: 'Vui lòng nhập Tiêu đề (Title).' });
      return;
    }
    if (!value.description?.trim()) {
      toast.error('Lỗi tạo Discount', { description: 'Vui lòng nhập Mô tả (Description).' });
      return;
    }
    if (!value.startDate) {
      toast.error('Lỗi tạo Discount', { description: 'Vui lòng chọn Ngày bắt đầu.' });
      return;
    }
    if (!value.endDate) {
      toast.error('Lỗi tạo Discount', { description: 'Vui lòng chọn Ngày kết thúc.' });
      return;
    }
    // Kiểm tra isActive (thường boolean thì luôn true/false, nhưng check null cho chắc)
    if (value.isActive === null || value.isActive === undefined) {
      toast.error('Lỗi tạo Discount', { description: 'Trạng thái hoạt động không hợp lệ.' });
      return;
    }

    // 2. Kiểm tra trường số (Value, MinOrderAmount)
    if (!value.value || isNaN(Number(value.value))) {
      toast.error('Lỗi tạo Discount', { description: 'Giá trị giảm giá (Value) không hợp lệ.' });
      return;
    }
    if (value.minOrderAmount === null || value.minOrderAmount === undefined || isNaN(value.minOrderAmount)) {
      toast.error('Lỗi tạo Discount', { description: 'Giá trị đơn hàng tối thiểu không hợp lệ.' });
      return;
    }

    // 3. Kiểm tra Logic Target Type
    if (!value.targetType) {
      toast.error('Lỗi tạo Discount', { description: 'Vui lòng chọn loại áp dụng (Target Type).' });
      return;
    }
    // Nếu là Book thì bắt buộc phải có categoryIds
    // (Giả sử 'BOOK' là giá trị enum/string bạn dùng, hãy sửa lại nếu tên khác, ví dụ 'CATEGORY' hay 'PRODUCT')
    if (value.targetType === 'BOOK') {
      if (!value.categoryIds || value.categoryIds.length === 0) {
        toast.error('Lỗi tạo Discount', { description: 'Vui lòng chọn ít nhất một Danh mục/Sách khi loại áp dụng là Book.' });
        return;
      }
    }

    // 4. Kiểm tra Logic Usage Limit (Giới hạn sử dụng)
    // Yêu cầu: usageLimit có thể là default (-1) nếu usageLimitPerUser có giá trị set (khác -1) và ngược lại.
    // Logic này có nghĩa là: Chỉ cần một trong hai cái hợp lệ về mặt logic số học, 
    // và ta chấp nhận giá trị -1 (mặc định) mà không báo lỗi.

    // Kiểm tra đơn giản: Đảm bảo chúng là số
    if (value.usageLimit === null || value.usageLimit === undefined || isNaN(value.usageLimit)) {
      toast.error('Lỗi tạo Discount', { description: 'Giới hạn sử dụng (Usage Limit) không hợp lệ.' });
      return;
    }
    if (value.usageLimitPerUser === null || value.usageLimitPerUser === undefined || isNaN(value.usageLimitPerUser)) {
      toast.error('Lỗi tạo Discount', { description: 'Giới hạn mỗi người dùng (Per User) không hợp lệ.' });
      return;
    }



    if (value.usageLimit === -1 && value.usageLimitPerUser === -1) {
      toast.error('Lỗi tạo Discount', { description: 'Vui lòng thiết lập ít nhất một loại giới hạn sử dụng.' });
      return;
    }
    // Kiểm tra pointCost chỉ được số nguyên dương >=0 
    if (value.pointCost === null || value.pointCost === undefined || isNaN(value.pointCost) || value.pointCost < 0) {
      toast.error('Lỗi tạo Discount', { description: 'Chi phí điểm (Point Cost) không hợp lệ. Vui lòng nhập số nguyên dương hoặc 0.' });
      return;
    }

    try {
      const response = await createDiscount({
        code: value.code,
        title: value.title,
        description: value.description,
        discountType: value.discountType,
        value: Number(value.value),
        targetType: {
          targetType: value.targetType,
          categoryIds: value.categoryIds
        },
        minOrderAmount: value.minOrderAmount,
        usageLimit: value.usageLimit,
        useCount: value.useCount,
        isActive: value.isActive,
        startDate: value.startDate,
        endDate: value.endDate,
        userRank: value.userRank,
        usageLimitPerUser: value.usageLimitPerUser,
        pointCost: value.pointCost,
      })
      if (response.code === 1000) {
        toast('Tạo Discount thành công!', {
          description: 'Tạo mới Discount thành công.',
          action: {
            label: 'Xác nhận',
            onClick: () => { },
          },
          duration: 3000,
          position: 'top-center',
        })

      } else {
        toast('Tạo Discount thất bại!', {
          description: `Lỗi: ${response.message}`,
          action: {
            label: 'Xác nhận',
            onClick: () => { },
          },
          duration: 3000,
          position: 'top-center',
        })
      }
    } catch (error) {
      toast('Tạo Discount thất bại!', {
        description: `Lỗi xảy ra khi tạo Discount, vui lòng thử lại sau.`,
        action: {
          label: 'Xác nhận',
          onClick: () => { },
        },
        duration: 3000,
        position: 'top-center',
      })
    }


  }

  return (
    <DiscountNewContext.Provider value={{ ...value, handleCreateDiscount }}>
      {children}
    </DiscountNewContext.Provider>
  )
}