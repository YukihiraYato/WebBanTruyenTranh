import { createFileRoute } from '@tanstack/react-router'
import DiscountNew from '@/features/discounts/new'
export const Route = createFileRoute('/_authenticated/discounts/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DiscountNew/>
}
