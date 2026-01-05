import { redirect } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

export const checkRole = (_context: any, allowedRoles: string[]) => {
  // 1. Lấy state trực tiếp từ store
  const state = useAuthStore.getState()
  const { isAuthenticated, user, accessToken } = state

  // 👇 IN LOG RA ĐỂ XEM NÓ ĐANG THẤY CÁI GÌ 👇
  console.log('🔍 DEBUG AUTH-GUARD:', {
    hasTokenInStore: !!accessToken,
    isAuthenticated,
    userObj: user,
    userRole: user?.role,
    requiredRoles: allowedRoles,
    checkRoleResult: user ? allowedRoles.includes(user.role) : 'No User'
  })

  // 2. Check đăng nhập
  if (!isAuthenticated || !user) {
    console.warn('❌ Bị chặn do: Chưa đăng nhập hoặc User null')
    
    toast.warning('Bạn cần đăng nhập để truy cập!', { duration: 3000 })
    throw redirect({
      to: '/sign-in',
      search: { redirect: location.href },
    })
  }

  // 3. Check quyền (Role)
  // Lưu ý: So sánh chính xác từng ký tự (ADMIN khác admin)
  const hasPermission = allowedRoles.includes(user.role)

  if (!hasPermission) {
    console.warn(`❌ Bị chặn do: Sai quyền. User có [${user.role}] nhưng cần [${allowedRoles}]`)
    
    toast.error('Bạn không có quyền truy cập trang này!', { duration: 3000 })
    throw redirect({ to: '/' }) // Hoặc trang 403
  }
}