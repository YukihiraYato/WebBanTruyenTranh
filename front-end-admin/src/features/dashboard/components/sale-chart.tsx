import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { useDashboardContext } from '@/context/DashboardContext'

// 1️⃣ Hàm format số ngắn gọn cho trục Y
const formatYAxis = (value: number) => {
  if (value >= 1000000000) {
    // Ví dụ: 3.500.000.000 -> 3.5 tỷ
    return `${(value / 1000000000).toFixed(1).replace(/\.0$/, '')} tỷ`
  }
  if (value >= 1000000) {
    // Ví dụ: 39.000.000 -> 39 tr
    return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')} triệu`
  }
  if (value >= 1000) {
     return `${(value / 1000).toFixed(0)} k`
  }
  return value.toLocaleString('vi')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-md border border-gray-200 bg-white p-3 text-sm shadow dark:border-neutral-700 dark:bg-neutral-900'>
        <p className='font-normal'>Tháng {String(label).replace('Th', '')}</p>
        <p>
          Đã mua{' '}
          <span className='font-normal text-[#8884d8]'>
             {/* Tooltip vẫn giữ nguyên số đầy đủ cho chi tiết */}
            {payload[0].value.toLocaleString('vi')}đ
          </span>
        </p>
      </div>
    )
  }

  return null
}

export function SaleChart() {
  const { monthlySales } = useDashboardContext()
  return (
    <div className='flex h-[300px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={monthlySales?.sales}
          // 2️⃣ Margin giờ có thể để nhỏ lại chút vì chữ đã ngắn hơn
          margin={{
            top: 5,
            left: 10, // Chỉnh tầm 10-20 là đẹp vì chữ "50 tr" nó ngắn
            right: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray='5 5' />
          <XAxis dataKey='name' />
          
          {/* 3️⃣ Áp dụng hàm format vào đây */}
          <YAxis
            tickFormatter={formatYAxis} 
            yAxisId='left'
            width={60} // Đặt chiều rộng cố định cho trục Y để thẳng hàng
          />
          
          <YAxis yAxisId='right' orientation='right' />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId='left'
            type='monotone'
            name='Doanh thu'
            dataKey='total'
            stroke='#8884d8'
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}