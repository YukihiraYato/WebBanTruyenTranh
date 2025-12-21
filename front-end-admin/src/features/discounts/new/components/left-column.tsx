import { useDiscountNewContext } from '@/context/DiscountNewContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import DiscountSelector from './discount-target'
import { CategorySelector } from './category-selector'
import UserRankSelector from './user-rank-selector'
import { ta } from 'date-fns/locale'
import { set } from 'date-fns'
export function LeftCard() {
  const {
    code,
    setCode,
    title,
    setTitle,
    description,
    setDescription,
    discountType,
    setDiscountType,
    value,
    setValue,
    pointCost,
    setPointCost,
    targetType,
    setTargetType,
    minOrderAmount,
    setMinOrderAmount,
    usageLimit,
    setUsageLimit,
    useCount,
    setUseCount,
    isActive,
    setIsActive,
    handleCreateDiscount: submit,
    categoryIds,
    setCategoryIds,
    userRank,
    setUserRank,
    usageLimitPerUser,
    setUsageLimitPerUser
  } = useDiscountNewContext()
  return (
    <Card>
      <CardContent>
        <div className='mb-3 font-semibold'>Thông tin khuyến mãi</div>
        <div className='grid grid-cols-2 gap-4'>
          {/* Tên khuyến mãi */}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Tên chương trình</div>
            <Input
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              placeholder='Ví dụ: khuyến mãi mùa hè 2025'
            />
          </div>
          {/* Chi tiết khuyến mãi */}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Chi tiết khuyến mãi</div>
            <Input
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              placeholder='Ví dụ: Khi mua hàng từ 500.000đ trở lên, bạn sẽ được giảm 10%'
            />
          </div>
          {/* Mã giảm giá */}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Mã giảm giá</div>
            <Input
              value={code}
              onChange={(ev) => setCode(ev.target.value)}
              placeholder='Ví dụ: SUMMER2025'
            />
          </div>
          {/* Giá trị */}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Giá trị giảm giá</div>
            <Input
              value={value}
              type='text'
              onChange={(ev) => {
                setValue(ev.target.value);
              }}
            />
          </div>
          {/* Loại giảm giá*/}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Loại giảm giá</div>
            <select style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }} value={discountType} onChange={(e) => {
              console.log(e.target.value)
              setDiscountType(e.target.value)
            }}>
              <option value="FIXED">Giảm theo số tiền</option>
              <option value="PERCENT">Giảm theo %</option>
            </select>
          </div>
          {/* Giá tiền tối thiểu*/}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Giá tiền tổi thiếu để áp được giảm giá</div>
            <Input
              value={minOrderAmount}
              type='number'
              onChange={(ev) => setMinOrderAmount(Number(ev.target.value))}

            />
          </div>
            {/* Giá xu discount */}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Giá xu discount</div>
            <Input
              value={pointCost}
              type='number'
              onChange={(ev) => setPointCost(Number(ev.target.value))}
            />
          </div>
          {/* Giới hạn số lần sử dụng*/}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Giới hạn số lần sử dụng của hệ thống  để áp được giảm giá</div>
            <Input
              value={usageLimit}
              type='number'
              onChange={(ev) => setUsageLimit(Number(ev.target.value))}
            />
          </div>
          {/* số lần đã sử dụng*/}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Số lần đã sử dụng mã giảm giá của hệ thống</div>
            <Input
              value={useCount}
              type='number'
              onChange={(ev) => setUseCount(Number(ev.target.value))}
            />
          </div>
           {/* số lần đã sử dụng đối với mỗi user*/}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Số lần  sử dụng mã giảm giá cho 1 user </div>
            <Input
              value={usageLimitPerUser}
              type='number'
              onChange={(ev) => setUsageLimitPerUser(Number(ev.target.value))}
            />
          </div>
          {/*Kích hoạt khuyến mãi*/}
          <div className='grid gap-2'>
            <div className='font-manrope text-sm'>Kích hoạt khuyến mãi</div>
            <select style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }} value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')}>
              <option value="active">Kích hoạt</option>
              <option value="inactive">Không kích hoạt</option>
            </select>
          </div>

          {/* Áp dụng cho */}
          <div className='col-span-2 grid gap-2'>
            <div className='font-manrope text-sm'>Áp dụng cho</div>
            <div className='flex gap-2'>
              <DiscountSelector
                value={targetType}
                onChange={(valueChange: string) => {
                  setTargetType(valueChange)
                }}
              />
            </div>
          </div>

          {targetType === 'BOOK' ? (
            <div className="col-span-2 grid gap-2">
              <div className="font-manrope text-sm">Áp dụng cho các loại sách</div>
              <div className="flex gap-2">
                <CategorySelector
                  value={categoryIds}
                  onChange={(valueChange: number[]) => setCategoryIds(valueChange)}
                />
              </div>
            </div>
          ) : null}
     

          <div className='col-span-2 grid gap-2'>
            <div className='font-manrope text-sm'>Áp dụng cho khách hàng VIP nếu có</div>
            <div className='flex gap-2'>
              <UserRankSelector value={userRank} onChange={(valueChange: string) => {
                setUserRank(valueChange)
              }} />
            </div>
          </div>



          <div className='col-span 2 mt-3' onClick={submit}>
            <Button variant='default'>Tạo khuyến mãi</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
