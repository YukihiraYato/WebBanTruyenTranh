import { useState , useEffect} from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { usePromotionUpdateContext } from '@/context/PromotionUpdateContext'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { parse } from 'date-fns'
export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
 
  const { startDate, setStartDate, endDate, setEndDate } = usePromotionUpdateContext()
 const [date, setDate] = useState<DateRange | undefined>()
  // Đồng bộ state với context khi context thay đổi
useEffect(() => {
  console.log("startDate raw:", JSON.stringify(startDate));
console.log("endDate raw:", JSON.stringify(endDate));
  if (typeof startDate === 'string' && typeof endDate === 'string') {
    try {
      const fromDate = parse(startDate.trim(), 'dd-MM-yyyy', new Date());
      const toDate = parse(endDate.trim(), 'dd-MM-yyyy', new Date());

      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        setDate({
          from: fromDate,
          to: toDate
        });
      } else {
        console.warn("Ngày không hợp lệ:", startDate, endDate);
      }
    } catch (err) {
      console.error("Lỗi parse date:", err);
    }
  }
}, [startDate, endDate]);
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'yyyy-MM-dd', { locale: vi })} ~{' '}
                  {format(date.to, 'yyyy-MM-dd', { locale: vi })}
                </>
              ) : (
                format(date.from, 'yyyy-MM-dd', { locale: vi })
              )
            ) : (
              <span>Chọn khoảng thời gian</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            locale={vi}
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate(range)
              if (range?.from && range?.to) {
                setStartDate(format(range.from, 'yyyy-MM-dd'))
                setEndDate(format(range.to, 'yyyy-MM-dd'))
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}