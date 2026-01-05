'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { resetPassword } from '@/api/user'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

// --- Schema Validation ---
const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
        newPassword: z.string().min(3, 'Mật khẩu mới phải có ít nhất 6 ký tự.'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới.'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp.',
        path: ['confirmPassword'],
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
        message: 'Mật khẩu mới không được trùng với mật khẩu cũ.',
        path: ['newPassword'],
    })

type PasswordFormValues = z.infer<typeof passwordSchema>

export default function ChangePasswordPage() {
    const [isLoading, setIsLoading] = useState(false)

    // State để toggle ẩn/hiện password cho từng ô
    const [showCurrentPass, setShowCurrentPass] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)
    const [showConfirmPass, setShowConfirmPass] = useState(false)

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (data: PasswordFormValues) => {
        try {
            setIsLoading(true) // 1. Bắt đầu loading

            // 2. Gọi API (nếu lỗi nó sẽ nhảy xuống catch ngay)
            await resetPassword(data.newPassword, data.confirmPassword)

            // 3. API thành công -> Xử lý ngay, không cần setTimeout trễ thêm
            toast.success('Đổi mật khẩu thành công!', {
                description: 'Vui lòng đăng nhập lại.',
            })

            form.reset()
            localStorage.clear() // Xóa token

            // 4. Delay nhẹ 1 chút ĐỂ CHUYỂN TRANG (chứ ko phải delay để hiện thông báo)
            // Mục đích: Cho người dùng kịp đọc cái Toast success 1-2s rồi mới đá về login
            setTimeout(() => {
                window.location.href = '/sign-in' 
            }, 500)

        } catch (error: any) {
            // 5. Xử lý khi có lỗi
            console.error(error)
            toast.error('Đổi mật khẩu thất bại', {
                description: error?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
            })
        } finally {
            // 6. Luôn tắt loading dù thành công hay thất bại (trừ khi redirect)
            // Nếu có redirect ở trên thì có thể không cần dòng này, nhưng an toàn thì cứ để.
            setIsLoading(false)
        }
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-white p-4 text-zinc-950'>
            <Card className='w-full max-w-md border-zinc-200 shadow-xl shadow-zinc-200/50'>
                <CardHeader className='space-y-1 text-center'>
                    <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100'>
                        <Lock className='h-6 w-6 text-zinc-900' />
                    </div>
                    <CardTitle className='text-2xl font-bold tracking-tight text-black'>
                        Đổi Mật Khẩu
                    </CardTitle>
                    <CardDescription className='text-zinc-500'>
                        Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản.
                    </CardDescription>
                </CardHeader>

                <div className="px-6">
                    <Separator className="bg-zinc-100" />
                </div>

                <CardContent className='pt-6'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>

                            {/* --- Current Password --- */}
                            <FormField
                                control={form.control}
                                name='currentPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-zinc-900 font-medium'>Mật khẩu hiện tại</FormLabel>
                                        <FormControl>
                                            <div className='relative'>
                                                <Input
                                                    type={showCurrentPass ? 'text' : 'password'}
                                                    placeholder='••••••'
                                                    className='border-zinc-300 bg-white pr-10 focus-visible:ring-black focus-visible:ring-offset-0 placeholder:text-zinc-400'
                                                    {...field}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black focus:outline-none'
                                                >
                                                    {showCurrentPass ? (
                                                        <EyeOff className='h-4 w-4' />
                                                    ) : (
                                                        <Eye className='h-4 w-4' />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className='text-red-600' />
                                    </FormItem>
                                )}
                            />

                            {/* --- New Password --- */}
                            <FormField
                                control={form.control}
                                name='newPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-zinc-900 font-medium'>Mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <div className='relative'>
                                                <Input
                                                    type={showNewPass ? 'text' : 'password'}
                                                    placeholder='••••••'
                                                    className='border-zinc-300 bg-white pr-10 focus-visible:ring-black focus-visible:ring-offset-0 placeholder:text-zinc-400'
                                                    {...field}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => setShowNewPass(!showNewPass)}
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black focus:outline-none'
                                                >
                                                    {showNewPass ? (
                                                        <EyeOff className='h-4 w-4' />
                                                    ) : (
                                                        <Eye className='h-4 w-4' />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className='text-red-600' />
                                    </FormItem>
                                )}
                            />

                            {/* --- Confirm Password --- */}
                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-zinc-900 font-medium'>Xác nhận mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <div className='relative'>
                                                <Input
                                                    type={showConfirmPass ? 'text' : 'password'}
                                                    placeholder='••••••'
                                                    className='border-zinc-300 bg-white pr-10 focus-visible:ring-black focus-visible:ring-offset-0 placeholder:text-zinc-400'
                                                    {...field}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black focus:outline-none'
                                                >
                                                    {showConfirmPass ? (
                                                        <EyeOff className='h-4 w-4' />
                                                    ) : (
                                                        <Eye className='h-4 w-4' />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage className='text-red-600' />
                                    </FormItem>
                                )}
                            />

                            <div className='pt-2'>
                                <Button
                                    type='submit'
                                    disabled={isLoading}
                                    className='w-full bg-black text-white hover:bg-zinc-800 transition-all duration-200 h-11 text-base font-medium shadow-md shadow-zinc-500/20'
                                >
                                    {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                                    Đổi Mật Khẩu
                                </Button>

                                <Button
                                    type='button'
                                    variant='ghost'
                                    className='mt-3 w-full text-zinc-500 hover:text-black hover:bg-zinc-100'
                                    onClick={() => form.reset()} // Hoặc navigate về trang trước
                                >
                                    Hủy bỏ
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}