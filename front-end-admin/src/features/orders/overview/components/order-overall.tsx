import {
  IconCash,
  IconCircleDashed,
  IconClockHour2,
  IconCreditCardRefund,
  IconMoodCheck,
  IconMoodSad2,
  IconTruckDelivery,
  IconTruckReturn,
  IconFilterCheck,
  IconClockCheck,
  IconCancel
} from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { number, string } from 'zod'
import { useOrderOverviewContext } from '@/context/OrderOverviewContext'
export function OrderOverall() {

  const { listQuantityStatus, setListQuantityStatus } = useOrderOverviewContext();

  return (
    <>
      {listQuantityStatus.length > 0 ? listQuantityStatus.map((item, index) => {
        return (
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-sm font-semibold'>{item.status}</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>
                  {item.count}
                </p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                {(() => {
                  switch (item.status) {
                    case 'PENDING_CONFIRMATION':
                      return (
                        <IconCircleDashed
                          className='text-orange-500 dark:text-gray-100'
                          size={34}
                        />
                      )
                     case 'CONFIRMED':
                      return (
                        <IconFilterCheck 
                          className='text-orange-500 dark:text-gray-100'
                          size={34}
                        />
                      )
                     case 'SHIPPING':
                      return (
                        <IconTruckDelivery
                          className='text-orange-500 dark:text-gray-100'
                          size={34}
                        />
                      )
                      case 'DELIVERED':
                        return (
                          <IconClockCheck
                            className='text-orange-500 dark:text-gray-100'
                            size={34}
                          />
                        )
                      case 'CANCELED':
                        return (
                          <IconMoodSad2
                            className='text-orange-500 dark:text-gray-100'
                            size={34}
                          />
                        )
                       case 'PENDING_REFUND':
                        return(
                          <IconCreditCardRefund
                            className='text-orange-500 dark:text-gray-100'
                            size={34} />
                        )
                        case 'APPROVED':
                        return(
                          <IconMoodCheck
                            className='text-orange-500 dark:text-gray-100'
                            size={34} />
                        )
                        case 'REJECTED':
                        return(
                          <IconCancel
                            className='text-orange-500 dark:text-gray-100'
                            size={34} />
                        )
                       
                  }
                })()}
              </div>
            </div>
          </Card>
        )
      }) : (
        <>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Chờ xác nhận</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>
                  630
                </p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconTruckDelivery
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Đã xác nhận</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>
                  172
                </p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconCash
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Đang vận chuyển</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>
                  213
                </p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconMoodCheck
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Đã chuyển đến</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>12</p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconTruckReturn
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Đã hủy</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>52</p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconMoodSad2
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Chờ duyệt xác nhận hoàn lại đồ</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>52</p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconCreditCardRefund
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Chấp thuận</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>5</p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconCircleDashed
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Đã hoàn tiền xong</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>73</p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconClockHour2
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
          <Card className='rounded-sm border p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col'>
                <h2 className='text-lg font-semibold'>Từ chối hoàn lại đồ</h2>
                <p className='font-manrope text-lg font-medium text-gray-500'>73</p>
              </div>
              <div className='rounded-md bg-orange-100 p-4 dark:bg-gray-700'>
                <IconClockHour2
                  className='text-orange-500 dark:text-gray-100'
                  size={34}
                />
              </div>
            </div>
          </Card>
        </>
      )}
    </>
  )
}
