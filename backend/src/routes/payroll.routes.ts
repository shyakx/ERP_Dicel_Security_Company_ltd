import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllPayrolls,
  getPayrollById,
  getPayrollsByEmployeeId,
  createPayroll,
  updatePayroll,
  updatePayrollStatus,
  deletePayroll,
} from '../controllers/payroll.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

// Define Role enum since it's not exported from @prisma/client
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all payrolls (ADMIN, MANAGER)
router.get('/', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllPayrolls(req, res);
  } catch (error) {
    next(error);
  }
});

// Get payroll by ID (ADMIN, MANAGER)
router.get('/:id', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getPayrollById(req, res);
  } catch (error) {
    next(error);
  }
});

// Get payrolls by employee ID (ADMIN, MANAGER, USER)
router.get('/employee/:employeeId', authorize([Role.ADMIN, Role.MANAGER, Role.USER]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getPayrollsByEmployeeId(req, res);
  } catch (error) {
    next(error);
  }
});

// Create payroll (ADMIN)
router.post('/', authorize([Role.ADMIN]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createPayroll(req, res);
  } catch (error) {
    next(error);
  }
});

// Update payroll (ADMIN)
router.put('/:id', authorize([Role.ADMIN]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updatePayroll(req, res);
  } catch (error) {
    next(error);
  }
});

// Update payroll status (ADMIN)
router.put('/:id/status', authorize([Role.ADMIN]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updatePayrollStatus(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete payroll (ADMIN)
router.delete('/:id', authorize([Role.ADMIN]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deletePayroll(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 