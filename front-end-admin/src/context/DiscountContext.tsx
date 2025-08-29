import { createContext, useContext, ReactNode } from 'react'
import { useDiscount} from '@/hooks/UseDiscount'
import { useEffect } from 'react'
import { getAllDiscounts } from '@/api/discount'
import { toast } from 'sonner';
import { DiscountResponse } from '@/types/discount'
interface DiscountContextType {
   listDiscount: DiscountResponse[];
  page: number;
  size: number;
  totalPages: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setTotalPages: (totalPages: number) => void;
  setListDiscount: (listDiscount: DiscountResponse[]) => void;

}
const DiscountContext = createContext<DiscountContextType>({
   listDiscount: [],
  page: 0,
  size: 10,
  totalPages: 1,
  setPage: () => {},
  setSize: () => {},
  setTotalPages: () => {},
  setListDiscount: () => {},

})
export const useDiscountContext = () => useContext(DiscountContext)
export const DiscountProvider = ({ children }: { children: ReactNode }) => {
  const value = useDiscount()

  // Reset the form when the provider mounts
  useEffect(() => {
   const fetchDiscounts = async () => {
      try {
        const response = await getAllDiscounts(value.page, value.size)
        console.log(response)
        if(response.code === 1000){
            value.setListDiscount(response.result.content)
            value.setTotalPages(response.result.totalPages)
        }
      } catch (error) {
        console.error('Error fetching discounts:', error)
      }
    }
    fetchDiscounts()
  }, [value.page, value.size])
//   const handleCreateDiscount = async () => {
//     try {
//       const response = await createDiscount({
//         code: value.code,
//         title: value.title,
//         description: value.description,
//         discountType: value.discountType,
//         value: value.value,
//         targetType: value.targetType,
//         minOrderAmount: value.minOrderAmount,
//         usageLimit: value.usageLimit,
//         useCount: value.useCount,
//         isActive: value.isActive,
//         startDate: value.startDate,
//         endDate: value.endDate
//       })
 
//     } catch (error) {
//       toast('Tạo Discount thất bại!', {
//         description: `Lỗi xảy ra khi tạo Discount, vui lòng thử lại sau.`,
//         action: {
//           label: 'Xác nhận',
//           onClick: () => { },
//         },
//         duration: 3000,
//         position: 'top-center',
//       })
//     }


//   }

  return (
    <DiscountContext.Provider value={value}>
      {children}
    </DiscountContext.Provider>
  )
}