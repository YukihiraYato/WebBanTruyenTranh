import { DiscountUpdateProvider } from '@/context/DiscountUpdateContext'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LeftCard } from './components/left-column'
import { RightCard } from './components/right-column'

export default function DiscountEdit() {
  return (
     <DiscountUpdateProvider>
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
       
          <div className='mb-2 flex items-center justify-between space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Chỉnh sửa khuyến mãi
            </h1>
          </div>
          <div className='grid grid-cols-2 items-start gap-4'>
            <LeftCard />
            <RightCard />
          </div>
        
      </Main>
    </>
    </DiscountUpdateProvider>
  )
}
