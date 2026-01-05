'use client'

import React, { useEffect, useState, useCallback } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
// import { User } from '../data/schema' // Đảm bảo đường dẫn đúng
import { getAllUsers, createNewUser, updateUser, resetPassword } from '@/api/user'

// Mock type User nếu chưa có file schema
// type User = any 

type UsersDialogType = 'add' | 'edit' | 'delete'

interface UsersContextType {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: any | null
  setCurrentRow: React.Dispatch<React.SetStateAction<any | null>>
  
  users: any[]
  setUsers: React.Dispatch<React.SetStateAction<any[]>>
  
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  size: number
  setSize: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  setTotalPages: React.Dispatch<React.SetStateAction<number>>
  
  keyword: string
  setKeyword: React.Dispatch<React.SetStateAction<string>>
  status: string | null
  setStatus: React.Dispatch<React.SetStateAction<string | null>>
  role: string | null
  setRole: React.Dispatch<React.SetStateAction<string | null>>
  
  getAllUsersFromBackend: () => Promise<void>
  createNewUserInBackend: (data: any) => Promise<any>
  updateUserInBackend: (userId: number, data: any) => Promise<any>
  resetPasswordInBackend: (userId: number) => Promise<any>
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<any | null>(null)
  
  const [users, setUsers] = useState<any[]>([])
  
  // State Pagination
  const [page, setPage] = useState<number>(0)
  const [size, setSize] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(0)
  
  // State Filter
  const [keyword, setKeyword] = useState<string>("")
  const [status, setStatus] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  // Hàm gọi API
  const getAllUsersFromBackend = useCallback(async () => {
    try {
      // Gọi API với page, size, và các filter hiện tại
      const response = await getAllUsers(page, size, keyword, status, role)
      
      // Giả sử API trả về structure: { result: { content: [], totalPages: 10 } }
      setUsers(response.result?.content || [])
      setTotalPages(response.result?.totalPages || 0)
    } catch (error) {
      console.error("Lỗi fetch users:", error)
      setUsers([])
    }
  }, [page, size, keyword, status, role])

  // --- Actions ---

  const createNewUserInBackend = async (data: any) => {
    const response = await createNewUser(data)
    // Sau khi tạo mới, reload lại trang hiện tại (hoặc về trang đầu)
    await getAllUsersFromBackend() 
    return response.message
  }

  const updateUserInBackend = async (userId: number, data: any) => {
    const response = await updateUser(userId, data)
    await getAllUsersFromBackend()
    return response.message
  }

  const resetPasswordInBackend = async (userId: number) => {
    const response = await resetPassword(userId)
    return response.message
  }

  // --- Trigger Effect ---
  // Mỗi khi page, size, keyword, status, role thay đổi -> Gọi lại API
  useEffect(() => {
    getAllUsersFromBackend()
  }, [getAllUsersFromBackend])

  return (
    <UsersContext.Provider value={{ 
      open, setOpen, 
      currentRow, setCurrentRow, 
      getAllUsersFromBackend, 
      createNewUserInBackend, 
      updateUserInBackend, 
      resetPasswordInBackend,
      users, setUsers,
      page, setPage, 
      size, setSize, 
      totalPages, setTotalPages,
      keyword, setKeyword, 
      status, setStatus, 
      role, setRole,
     }}>
      {children}
    </UsersContext.Provider>
  )
}

export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)
  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }
  return usersContext
}