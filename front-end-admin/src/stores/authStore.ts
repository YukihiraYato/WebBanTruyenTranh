import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'


interface User {
  userId: number
  username: string
  email: string
  fullName: string
  role: string,
  dateOfBirth: string,
  gender: string,
  phoneNum: string,
  verify: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean

  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // State mặc định (ban đầu là rỗng, Middleware sẽ tự điền vào sau)
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // Hàm Login: Chỉ cần set state, Middleware tự lưu vào LocalStorage
      login: (user, token) => {
        // Log ra để chắc chắn data đầu vào đúng
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        })
      },

      // Hàm Logout: Reset state, Middleware tự xóa LocalStorage
      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
        localStorage.clear() 
        window.location.href = '/sign-in'
      },
    }),
    {
      name: 'admin-storage', 
      storage: createJSONStorage(() => localStorage), // Định nghĩa nơi lưu
    }
  )
)