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
import { useCustomerDetailsContext } from '@/context/CustomerDetailsContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (active && payload && payload.length) {
    return (
      <div className='rounded-md border border-gray-200 bg-white p-3 text-sm shadow dark:border-neutral-700 dark:bg-neutral-900'>
        <p className='font-normal'>Tháng {String(label).replace('th', '')}</p>
        <p>
          Đã mua{' '}
          <span className='font-normal text-[#8884d8]'>
            {payload[0].value.toLocaleString('vi')}đ
          </span>
        </p>
      </div>
    )
  }

  return null
}

export function SaleChart() {
  const { summary } = useCustomerDetailsContext()
  return (
    <div className='h-[300px]'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          width={500}
          height={300}
          data={summary?.frequency || []}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis
            tickFormatter={(v: number) => `${v.toLocaleString('vi')}đ`}
            yAxisId='left'
          />
          <YAxis yAxisId='right' orientation='right' />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId='left'
            type='monotone'
            name='Chi tiêu'
            dataKey='amount'
            stroke='#8884d8'
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
