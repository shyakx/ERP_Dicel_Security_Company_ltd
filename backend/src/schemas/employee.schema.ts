import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(10, 'Invalid phone number'),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  dateOfBirth: z.string().datetime(),
  dateJoined: z.string().datetime(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name must be at least 2 characters'),
    relationship: z.string().min(1, 'Relationship is required'),
    phoneNumber: z.string().min(10, 'Invalid phone number')
  }).optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  }).optional()
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeQuerySchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
}); 