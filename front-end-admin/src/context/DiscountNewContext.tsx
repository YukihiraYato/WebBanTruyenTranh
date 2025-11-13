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
  usageLimit: 0,
  setUsageLimit: () => { },
  useCount: 0,
  setUseCount: () => { },
  isActive: true,
  setIsActive: () => { },
  startDate: '',
  setStartDate: () => { },
  endDate: '',
  setEndDate: () => { },
  handleCreateDiscount: () => { }
})
export const useDiscountNewContext = () => useContext(DiscountNewContext)
export const DiscountNewProvider = ({ children }: { children: ReactNode }) => {
  const value = useDiscountNew()

  // Reset the form when the provider mounts
  // useEffect(() => {

  // }, [value])
  const handleCreateDiscount = async () => {
    try {
      const response = await createDiscount({
        code: value.code,
        title: value.title,
        description: value.description,
        discountType: value.discountType,
        value: Number(value.value),
        targetType: value.targetType,
        minOrderAmount: value.minOrderAmount,
        usageLimit: value.usageLimit,
        useCount: value.useCount,
        isActive: value.isActive,
        startDate: value.startDate,
        endDate: value.endDate
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