import { createContext, useContext, ReactNode, useState } from 'react'
import { useDiscountUpdate } from '@/hooks/UseDiscountUpdate'
import { useEffect } from 'react'
import { getDiscountDetails, updateDiscount } from '@/api/discount'
import { toast } from 'sonner';
import { useParams } from "@tanstack/react-router";
interface DiscountUpdateContextType {
  id: number;
  setId: (id: number) => void;
  code: string;
  setCode: (code: string) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  discountType: string; // or enum, depending on your use case
  setDiscountType: (discountType: string) => void;
  value: number; // or string, depending on your use case
  setValue: (value: number) => void;
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
  handleUpdateDiscount: () => void; // add this property
  isLoanding?: boolean; // add this property
  setIsLoanding?: (isLoanding: boolean) => void; // add this property
}
const DiscountUpdateContext = createContext<DiscountUpdateContextType>({
  id: 0,
  setId: () => { },
  code: '',
  setCode: () => { },
  title: '',
  setTitle: () => { },
  description: '',
  setDescription: () => { },
  discountType: 'PERCENT',
  setDiscountType: () => { },
  value: 0,
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
  handleUpdateDiscount: () => { },
  isLoanding: false,
  setIsLoanding: () => { },
})
export const useDiscountUpdateContext = () => useContext(DiscountUpdateContext)
export const DiscountUpdateProvider = ({ children }: { children: ReactNode }) => {
  const value = useDiscountUpdate()
  const { id } = useParams({ strict: false })
  const [isLoading, setIsLoading] = useState(false);
  // Reset the form when the provider mounts
  useEffect(() => {
    const fetchDiscountDetails = async (id: number) => {
      try {
        const data = await getDiscountDetails(id);
        setIsLoading(true)
        value.setId(id);
        value.setCode(data.result.code);
        value.setTitle(data.result.title);
        value.setDescription(data.result.description);
        value.setDiscountType(data.result.discountType);
        value.setValue(data.result.value);
        value.setTargetType(data.result.targetType);
        value.setMinOrderAmount(data.result.minOrderAmount);
        value.setUsageLimit(data.result.usageLimit);
        value.setUseCount(data.result.useCount);
        value.setIsActive(data.result.isActive);
        value.setStartDate(data.result.startDate);
        value.setEndDate(data.result.endDate);

      } catch (error) {
        toast('Lấy chi tiết Discount thất bại!', {
          description: `Lỗi xảy ra khi lấy chi tiết Discount, vui lòng thử lại sau.`,
          action: {
            label: 'Xác nhận',
            onClick: () => { },
          },
          duration: 3000,
          position: 'top-center',
        })
      }
    }
    fetchDiscountDetails(Number(id));

    console.log('Fetched discount details for id:', id);
  }, [id])
  const handleUpdateDiscount = async () => {
    try {
      const response = await updateDiscount({
        id: value.id,
        code: value.code,
        title: value.title,
        description: value.description,
        discountType: value.discountType,
        value: value.value,
        targetType: value.targetType,
        minOrderAmount: value.minOrderAmount,
        usageLimit: value.usageLimit,
        useCount: value.useCount,
        isActive: value.isActive,
        startDate: value.startDate,
        endDate: value.endDate
      })
      if (response.code === 1000) {
        toast('Update Discount thành công!', {
          description: 'Update mới Discount thành công.',
          action: {
            label: 'Xác nhận',
            onClick: () => { },
          },
          duration: 3000,
          position: 'top-center',
        })

      } else {
        toast('Update Discount thất bại!', {
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
      toast('Update Discount thất bại!', {
        description: `Lỗi xảy ra khi cập nhập Discount, vui lòng thử lại sau.`,
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
    <DiscountUpdateContext.Provider value={{ ...value, handleUpdateDiscount, isLoanding: isLoading, setIsLoanding: setIsLoading }}>
      {children}
    </DiscountUpdateContext.Provider>
  )
}