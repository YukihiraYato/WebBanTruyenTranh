// context/PromotionNewContext.tsx
import { createContext, useContext, ReactNode } from 'react'
import { usePromotionUpdate } from '@/hooks/UsePromotionUpdate'

const PromotionProviderContext = createContext<ReturnType<typeof usePromotionUpdate>>(
  {} as ReturnType<typeof usePromotionUpdate>
)

export const usePromotionUpdateContext = () => useContext(PromotionProviderContext)

export const PromotionUpdateProvider = ({ children }: { children: ReactNode }) => {
  const value = usePromotionUpdate()
  return (
    <PromotionProviderContext.Provider value={value}>
      {children}
    </PromotionProviderContext.Provider>
  )
}
