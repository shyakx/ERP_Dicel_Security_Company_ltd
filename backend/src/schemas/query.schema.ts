import * as z from 'zod';

// Helper function to validate pagination parameters
const validatePagination = (val: string | undefined, ctx: z.RefinementCtx) => {
  if (!val) return undefined;
  const num = parseInt(val, 10);
  if (isNaN(num) || num < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid pagination parameter'
    });
    return z.NEVER;
  }
  // Enforce maximum limit of 100 records per page
  if (num > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Pagination limit exceeded'
    });
    return z.NEVER;
  }
  return num;
};

// Helper function to validate date format
const validateDate = (val: string | undefined, ctx: z.RefinementCtx) => {
  if (!val) return undefined;
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid date format'
    });
    return z.NEVER;
  }
  return val;
};

// Helper function to sanitize input
const sanitizeInput = (val: string | undefined, ctx: z.RefinementCtx) => {
  if (!val) return undefined;
  // Remove SQL injection attempts
  if (val.match(/['";\\/]/)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid input detected'
    });
    return z.NEVER;
  }
  // Remove XSS attempts
  if (val.match(/<[^>]*>/)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid input detected'
    });
    return z.NEVER;
  }
  // Allow special characters but escape them
  return val.replace(/[&<>"']/g, (char) => {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escapeMap[char];
  });
};

// Define Zod schemas for query parameters
export const attendanceQuerySchema = z.object({
  employeeId: z.string().optional().transform(sanitizeInput),
  projectId: z.string().optional().transform(sanitizeInput),
  startDate: z.string().optional().transform(validateDate),
  endDate: z.string().optional().transform(validateDate),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']).optional(),
  page: z.string().transform((val, ctx) => validatePagination(val, ctx)).optional(),
  limit: z.string().transform((val, ctx) => validatePagination(val, ctx)).optional(),
  format: z.enum(['csv', 'pdf', 'excel', 'preview']).optional(),
  search: z.string().optional().transform(sanitizeInput),
  sortBy: z.enum(['checkIn', 'checkOut', 'status', 'employeeId', 'projectId']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  include: z.string().optional().transform((val, ctx) => {
    if (!val) return undefined;
    const validRelations = ['employee', 'project'];
    const relations = val.split(',');
    const invalidRelations = relations.filter(r => !validRelations.includes(r));
    if (invalidRelations.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid relations: ${invalidRelations.join(', ')}`
      });
      return z.NEVER;
    }
    return val;
  })
});

export const leaveQuerySchema = z.object({
  employeeId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.string().transform((val) => parseInt(val, 10)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  format: z.enum(['csv', 'pdf', 'excel', 'preview']).optional()
});

export const payrollQuerySchema = z.object({
  employeeId: z.string().optional(),
  month: z.string().transform((val) => parseInt(val, 10)).optional(),
  year: z.string().transform((val) => parseInt(val, 10)).optional(),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED']).optional(),
  page: z.string().transform((val) => parseInt(val, 10)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  format: z.enum(['csv', 'pdf', 'excel', 'preview']).optional()
});

export const incidentQuerySchema = z.object({
  projectId: z.string().optional(),
  reportedById: z.string().optional(),
  assignedToId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  page: z.string().transform((val) => parseInt(val, 10)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  format: z.enum(['csv', 'pdf', 'excel', 'preview']).optional()
});

export const equipmentQuerySchema = z.object({
  type: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED']).optional(),
  page: z.string().transform((val) => parseInt(val, 10)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  format: z.enum(['csv', 'pdf', 'excel', 'preview']).optional()
});

export const projectQuerySchema = z.object({
  clientId: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().transform((val) => parseInt(val, 10)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
  format: z.enum(['csv', 'pdf', 'excel', 'preview']).optional()
}); 