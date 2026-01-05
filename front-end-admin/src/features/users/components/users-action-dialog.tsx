'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SelectDropdown } from '@/components/select-dropdown'
import { useUsers } from '../context/users-context'
import { toast } from 'sonner'

// --- Constants ---
const userRoles = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Customer', value: 'CUSTOMER' },
]

const userStatuses = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Disabled', value: 'DISABLED' },
]

const userGenders = [
  { label: 'Nam', value: 'Nam' },
  { label: 'Nữ', value: 'Nữ' },
  { label: 'Khác', value: 'Khác' },
]

// --- Helper: Convert Date ---
const convertDateToISO = (dateInput: any) => {
  if (!dateInput) return '';
  const dateStr = String(dateInput).trim();
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('-');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  if (!isNaN(Date.parse(dateStr))) {
     try {
        return new Date(dateStr).toISOString().split('T')[0];
     } catch (e) {
        return '';
     }
  }
  return dateStr;
};


// --- Schemas Strategy ---
// 1. General Schema: Các trường dùng chung cho cả 2 trường hợp
const generalSchema = z.object({
  email: z.string().min(1, { message: 'Email is required.' }).email(),
  fullName: z.string().min(1, { message: 'Full Name is required.' }),
  phoneNum: z.string().min(1, { message: 'Phone is required.' }),
  role: z.string().min(1, { message: 'Role is required.' }),
  gender: z.string().optional(),
  dob: z.string().optional(),
})

// 2. Create Schema: General + Username + Passwords
const createSchema = generalSchema.extend({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(2, { message: 'Password must be at least 2 characters.' }),
  confirmPassword: z.string().min(1, { message: 'Confirm Password is required.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// 3. Edit Schema: General + Status + Verified
const editSchema = generalSchema.extend({
  status: z.string().min(1, { message: 'Status is required.' }),
  verified: z.boolean(),
})

// Type chung (Union type để TS không báo lỗi khi truy cập property)
type UserForm = z.infer<typeof createSchema> & z.infer<typeof editSchema>

interface Props {
  currentRow?: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { updateUserInBackend, createNewUserInBackend } = useUsers()
  const isEdit = !!currentRow
  
  // LOGIC CHỌN SCHEMA: Nếu Edit -> dùng editSchema, ngược lại -> createSchema
  const formSchema = isEdit ? editSchema : createSchema;

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      phoneNum: '',
      role: 'CUSTOMER',
      gender: 'Nam',
      dob: '',
      password: '',
      confirmPassword: '',
      status: 'ACTIVE', // Default an toàn
      verified: false,
    },
  })

  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        // --- EDIT MODE ---
        const backendDate = currentRow.dateOfBirth || currentRow.dob; 
        form.reset({
          fullName: currentRow.fullName,
          email: currentRow.email,
          phoneNum: currentRow.phoneNum || currentRow.phoneNumber || '',
          role: currentRow.role || 'CUSTOMER',
          gender: currentRow.gender || 'Nam',
          dob: convertDateToISO(backendDate),
          // Các trường dành riêng cho Edit
          status: currentRow.status || 'ACTIVE',
          verified: currentRow.verified || false,
        } as any) // Ép kiểu any để tránh TS check username (vì edit không có username)
      } else {
        // --- CREATE MODE ---
        form.reset({
          username: '',
          fullName: '',
          email: '',
          phoneNum: '',
          role: 'CUSTOMER',
          gender: 'Nam',
          dob: '',
          password: '',
          confirmPassword: '',
          // Mặc định cho create (dù ẩn trên UI nhưng set cho sạch)
          status: 'ACTIVE',
          verified: false,
        })
      }
    }
  }, [open, isEdit, currentRow, form])

  const onSubmit = async (values: UserForm) => {
    let payload: any = { ...values };

    // Format Date
    if (values.dob) {
      const [year, month, day] = values.dob.split('-');
      payload.dateOfBirth = `${day}-${month}-${year}`; 
      delete payload.dob; 
    }

    // Cleanup payload dựa trên Mode
    if (isEdit) {
      delete payload.password;
      delete payload.confirmPassword;
      delete payload.username;
      // Giữ lại status và verified
    } else {
      delete payload.confirmPassword;
      // Xóa status và verified vì Backend tự set mặc định khi create
      delete payload.status;
      delete payload.verified;
    }

    console.log("Submitting payload:", payload);

    try {
      if (isEdit) {
        const userId = currentRow?.id || currentRow?._id || currentRow?.userId;
        if (!userId) return;
        if (updateUserInBackend) {
          await updateUserInBackend(userId, payload);
        }
      } else {
        if (createNewUserInBackend) {
          await createNewUserInBackend(payload);
        }
      }
      toast("Thao tác thành công", { duration: 3000 })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Submit error:", error);
      toast("Có lỗi xảy ra, vui lòng kiểm tra lại.", { duration: 3000 })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update user profile.' : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>

        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              {/* --- USERNAME: Chỉ hiện khi Create --- */}
              {!isEdit && (
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-right'>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='username123' className='col-span-4' autoComplete='off' {...field} />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='John Doe' className='col-span-4' autoComplete='off' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='email@example.com' className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              {/* --- PASSWORD: Chỉ hiện khi Create --- */}
              {!isEdit && (
                <>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-right'>Password</FormLabel>
                        <FormControl>
                          <Input type='password' placeholder='******' className='col-span-4' {...field} />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-right'>Confirm Pass</FormLabel>
                        <FormControl>
                          <Input type='password' placeholder='******' className='col-span-4' {...field} />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name='phoneNum'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder='+123456789' className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Role</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select role'
                      className='col-span-4'
                      items={userRoles}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              
              {/* --- STATUS & VERIFIED: Chỉ hiện khi Edit --- */}
              {isEdit && (
                <>
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-right'>Status</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='Select status'
                          className='col-span-4'
                          items={userStatuses}
                        />
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='verified'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-right'>Verified</FormLabel>
                        <FormControl>
                          <div className='col-span-4 flex items-center space-x-2'>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className='text-sm text-muted-foreground'>
                              {field.value ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
              {/* ------------------------------------------- */}

              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Gender</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select gender'
                      className='col-span-4'
                      items={userGenders}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='dob'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>DoB</FormLabel>
                    <FormControl>
                      <Input 
                        type='date' 
                        className='col-span-4' 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}