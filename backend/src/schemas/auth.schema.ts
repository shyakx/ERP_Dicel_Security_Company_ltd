import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  dateOfBirth: z.string().datetime(),
  dateJoined: z.string().datetime()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
}); 