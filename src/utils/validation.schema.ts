import { z } from 'zod'
const nameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/
const nameSchema = z
  .string()
  .trim()
  .regex(nameRegex, 'Name must Contain letters and single space between words')

// const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(100)
  .email('email format is invalid')
const passwordRegex =
  /^(?=\S{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/

const passwordSchema = z
  .string()
  .trim()
  .regex(
    passwordRegex,
    'Password must be at least 8 characters long and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
  )

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().trim().min(1, 'Confirm password is required'),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})


export const resetPasswordSchema = z
  .object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'New password must be different from old password',
    path: ['newPassword'],
  });