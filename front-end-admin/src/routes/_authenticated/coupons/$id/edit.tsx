import { createFileRoute } from '@tanstack/react-router'
import CouponEdit from '@/features/coupons/edit'
export const Route = createFileRoute('/_authenticated/coupons/$id/edit')({
  component: CouponEditComponent,
})
function CouponEditComponent() {

  return (

    <CouponEdit />

  )
}