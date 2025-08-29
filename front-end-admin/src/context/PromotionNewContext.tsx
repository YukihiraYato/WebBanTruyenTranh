// context/PromotionNewContext.tsx
import { createContext, useContext, ReactNode } from 'react'
import { usePromotion } from '@/hooks/UsePromotionNew'

const PromotionNewContext = createContext<ReturnType<typeof usePromotion>>(
  {} as ReturnType<typeof usePromotion>
)

export const usePromotionNewContext = () => useContext(PromotionNewContext)

export const PromotionNewProvider = ({ children }: { children: ReactNode }) => {
  const value = usePromotion()
  return (
    <PromotionNewContext.Provider value={value}>
      {children}
    </PromotionNewContext.Provider>
  )
}
