import { Card, CardContent } from '@/components/ui/card'
import { DatePickerWithRange } from '@/features/discounts/edit/components/date-picker'
import { useDiscountUpdateContext } from '@/context/DiscountUpdateContext'
export function RightCard() {
  const{
    isLoanding
  } = useDiscountUpdateContext()
  return (
    isLoanding ? (
    <Card>
      <CardContent>
        <div className="mb-3 font-semibold">Thời gian khuyến mãi</div>
        <DatePickerWithRange />
      </CardContent>
    </Card>) : <div>Loading...</div>
  )
}
