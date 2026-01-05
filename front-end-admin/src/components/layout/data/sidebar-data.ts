import {
  IconMessages,
  IconUsers,
  IconBooks,
  IconShoppingBag,
  IconDeviceDesktopAnalytics,
  IconTicket,
  IconLogout,
  IconEdit,
  IconBuildingWarehouse,
  IconPasswordUser
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'
import { useAuthStore } from '@/stores/authStore'
export const sidebarData: SidebarData = {
  user: {
    name: 'admin',
    email: 'admin@email.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Cơ bản',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: IconDeviceDesktopAnalytics,
        },
        {
          title: 'Sản phẩm',
          items: [
            {
              title: 'Danh sách',
              url: '/products/overview',
            },
            {
              title: 'Thêm mới',
              url: '/products/new',
            },
          ],
          icon: IconBooks,
        },
        {
          title: 'Kho hàng',
          items: [
             {
              title: 'Nhập kho',
              url: '/import/create',
             },
             {
              title: 'Dach sách đơn nhập kho',
              url: '/import/stock',
              role: ['ADMIN']
             }
          ],
          icon: IconBuildingWarehouse,
        },
        {
          title: 'Đánh giá',
          url: '/review/reviewPage',
          icon: IconEdit,
        },

        {
          title: 'Đơn hàng',
          url: '/orders/overview',
          icon: IconShoppingBag,
        },
        {
          title: 'Khuyến mãi',
          items: [
            {
              title: 'Danh sách',
              url: '/coupons/overview',
            },
            {
              title: 'Thêm mới',
              url: '/coupons/new',
            },
          ],
          icon: IconTicket,
        },
        {
          title: 'Mã giảm giá',
          items: [
            {
              title: 'Danh sách',
              url: '/discounts/overview',
            },
            {
              title: 'Thêm mới',
              url: '/discounts/new',
            },
          ],
          icon: IconTicket,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: IconMessages,
        },
        {
          title: 'Người dùng',
          url: '/users',
          icon: IconUsers,
          role: ['ADMIN']
        },
        {
          title: 'Đổi mật khẩu',
          url: '/change-password',
          icon: IconPasswordUser,
        },
        {
          title: 'Đăng xuất',
          url: '/sign-in',
          icon: IconLogout,
          onClick: () => {
            useAuthStore.getState().logout()
          },


        }
      ],
    },
  ],
}
