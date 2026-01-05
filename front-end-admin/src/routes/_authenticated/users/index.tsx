import { createFileRoute } from '@tanstack/react-router'
import Users from '@/features/users'
import { checkRole } from '@/utils/auth-guard'
export const Route = createFileRoute('/_authenticated/users/')({
  beforeLoad: ({context}) =>{
    checkRole(context, ["ADMIN"])
  }
  ,
  component: Users,
})
