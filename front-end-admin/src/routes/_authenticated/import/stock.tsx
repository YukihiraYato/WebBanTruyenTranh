import { createFileRoute } from '@tanstack/react-router'
import StockPage from '@/features/import-product/StockPage'
import { checkRole } from '@/utils/auth-guard'
export const Route = createFileRoute('/_authenticated/import/stock')({
  beforeLoad:  (context) => {
     checkRole(context, ['ADMIN'])
  },
  component: StockPage,
})
