import { createFileRoute } from '@tanstack/react-router'
import ChangePasswordPage from '@/features/change-password/ChangePasswordPage'

export const Route = createFileRoute('/_authenticated/change-password/')({
  component: ChangePasswordPage,
})
