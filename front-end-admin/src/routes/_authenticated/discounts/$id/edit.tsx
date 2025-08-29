import { createFileRoute } from '@tanstack/react-router'
import DiscountEdit from '@/features/discounts/edit'
export const Route = createFileRoute('/_authenticated/discounts/$id/edit')({
  component: DiscountEditComponent,
})
function DiscountEditComponent() {

  return (

    <DiscountEdit />

  )
}