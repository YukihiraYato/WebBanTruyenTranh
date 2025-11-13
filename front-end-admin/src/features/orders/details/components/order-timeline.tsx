import {
  IconCircleCheck,
  IconClock,
  IconTruck,
  IconPackage,
  IconCircleX,
} from '@tabler/icons-react'
import { useOrderDetailsContext } from '@/context/OrderDetailsContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function OrderTimeLine() {
  const { order } = useOrderDetailsContext()

  if (!order?.timeFor5StatusOrder) return null

  const t = order.timeFor5StatusOrder

  // ✅ chọn mốc kết thúc: delivered hoặc cancelled
  const finalStatus =
    t.cancelledDate != null
      ? { key: 'cancelledDate', label: 'Đã hủy đơn', date: t.cancelledDate }
      : t.deliveredDate != null
      ? { key: 'deliveredDate', label: 'Đã giao hàng', date: t.deliveredDate }
      : null

  // ✅ thời gian fallback (nếu chưa có confirmed/shipping nhưng đã delivered/cancelled)
  const fallbackTime = finalStatus?.date ?? null

  const timelineSteps = [
    {
      key: 'pendingConfirmationDate',
      label: 'Chờ xác nhận',
      icon: <IconClock size={20} />,
      date: t.pendingConfirmationDate ?? fallbackTime,
    },
    {
      key: 'confirmedDate',
      label: 'Đã xác nhận',
      icon: <IconCircleCheck size={20} />,
      date: t.confirmedDate ?? fallbackTime,
    },
    {
      key: 'shippingDate',
      label: 'Đang giao hàng',
      icon: <IconTruck size={20} />,
      date: t.shippingDate ?? fallbackTime,
    },
  ]

  // ✅ thêm mốc cuối cùng (delivered hoặc cancelled nếu có)
  if (finalStatus) {
    timelineSteps.push({
      key: finalStatus.key,
      label: finalStatus.label,
      icon:
        finalStatus.key === 'cancelledDate' ? (
          <IconCircleX size={20} />
        ) : (
          <IconPackage size={20} />
        ),
      date: finalStatus.date,
    })
  }

  return (
    <Card className='rounded-none'>
      <CardHeader>
        <CardTitle>Timeline đơn hàng</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className='relative ml-2 flex flex-col space-y-12'>
          {/* đường timeline dọc */}
          <div className='absolute top-0 left-0 h-full w-[1.5px] bg-neutral-100 dark:bg-gray-700' />

          {timelineSteps.map((step, index) => {
            const isDone = step.date !== null
            const isCancelled = step.key === 'cancelledDate'

            return (
              <div key={index} className='relative ps-16'>
                {/* icon */}
                <div
                  className={`absolute top-0 left-0 flex h-10 w-10 -translate-x-5 items-center justify-center rounded-full 
                    ${
                      isCancelled
                        ? 'bg-red-100 text-red-500 dark:bg-red-800/30'
                        : isDone
                        ? 'bg-green-100 text-green-500 dark:bg-green-800/30'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                    }`}
                >
                  {step.icon}
                </div>

                {/* nội dung */}
                <div className='flex items-center justify-between'>
                  <div className='flex flex-col gap-2'>
                    <span
                      className={`font-medium ${
                        isCancelled
                          ? 'text-red-500'
                          : isDone
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.date ? (
                      <span className='text-sm text-gray-500'>{step.date}</span>
                    ) : (
                      <span className='text-sm text-gray-400 italic'>Chưa cập nhật</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
