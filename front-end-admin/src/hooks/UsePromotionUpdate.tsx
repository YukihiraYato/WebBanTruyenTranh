import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { updatePromotion, getPromotionDetails } from '@/api/promotion'
import { useParams } from "@tanstack/react-router";
export function usePromotionUpdate() {
  const [promotionId, setPromotionId] = useState<number | 0>(0)
  const [promotionName, setPromotionName] = useState<string>('')
  const [discountPercentage, setDiscountPercentage] = useState<number>(10)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const { id } = useParams({ strict: false })
  const update = async () => {
    const dto = {
      promotionId,
      promotionName,
      discountPercentage,
      startDate,
      endDate,
      categoryIds,
    }
    try {

      await updatePromotion(dto)

      toast('Thao tác thành công!', {
        description: 'Cập nhập khuyến mãi thành công.',
        action: {
          label: 'Xác nhận',
          onClick: () => { },
        },
        position: 'top-center',
        duration: 5000
      })
    } catch (error: any) {
      toast('Thao tác thất bại!', {
        description: `Có lỗi xảy ra: ${error.message || 'Không rõ nguyên nhân.'}`,
        action: {
          label: 'Xác nhận',
          onClick: () => { },
        },
        position: 'top-center',
        duration: 5000
      })
    }
  }
  useEffect(() => {

    const fetchPromotionDetails = async (id: number) => {
      try {
        if (id !== 0) {
          const promotion = (await getPromotionDetails(id)).result
          setPromotionName(promotion.promotionName)
          setPromotionId(promotion.promotionId)
          setDiscountPercentage(promotion.discountPercentage)
          setStartDate(promotion.startDate)
          setEndDate(promotion.endDate)
          const categoryIds = promotion.categories.map((c) => c.categoryId)
          setCategoryIds(categoryIds)
        } else {
          // toast.error('Không tìm thấy khuyến mãi với ID này.', {
          //   duration: 5000,
          //   action: {
          //     label: 'Xác nhận',
          //     onClick: () => { },
          //   },
          // })
        }
      } catch (error: any) {
        // toast.error(`Lỗi khi tải thông tin khuyến mãi: ${error.message}`, {
        //   duration: 5000,
        //   action: {
        //     label: 'Xác nhận',
        //     onClick: () => { },
        //   },
        // })
      }

    }
    fetchPromotionDetails(parseInt(id || '0'))
  }, [promotionId])
  return {
    promotionId,
    setPromotionId,
    promotionName,
    setPromotionName,
    discountPercentage,
    setDiscountPercentage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    categoryIds,
    setCategoryIds,
    update,
  }
}
