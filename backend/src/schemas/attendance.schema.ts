import { z } from 'zod';

export const createAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  date: z.string().datetime(),
  clockIn: z.string().datetime(),
  clockOut: z.string().datetime().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']),
  notes: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional()
});

export const updateAttendanceSchema = createAttendanceSchema.partial();

export const attendanceQuerySchema = z.object({
  employeeId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']).optional(),
  department: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const bulkAttendanceSchema = z.array(createAttendanceSchema); 