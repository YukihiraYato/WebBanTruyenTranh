
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDashboardContext } from '@/context/DashboardContext'

export function DateFilter() {
  const { month, year, setMonth, setYear } = useDashboardContext()

  // Tạo danh sách năm (Ví dụ: từ 2020 đến năm hiện tại + 1)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  return (
    <div className="flex gap-2" style={{marginRight: "20px"}}>
      {/* Chọn Tháng */}
      <Select value={month.toString()} onValueChange={(val) => setMonth(Number(val))}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Tháng" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <SelectItem key={m} value={m.toString()}>
              Tháng {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Chọn Năm */}
      <Select  value={year.toString()} onValueChange={(val) => setYear(Number(val))}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Năm" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              Năm {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}