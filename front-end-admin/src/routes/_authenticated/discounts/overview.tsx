import { createFileRoute } from '@tanstack/react-router'
import DiscountOverview from '@/features/discounts/overview'
export const Route = createFileRoute('/_authenticated/discounts/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DiscountOverview/>
}
