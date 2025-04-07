import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllLeaves,
  getLeaveById,
  getLeavesByEmployee,
  createLeave,
  updateLeave,
  processLeave,
  deleteLeave,
} from '../controllers/leave.controller';
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

// Get all leave requests (ADMIN, MANAGER)
router.get('/', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getAllLeaves(req, res);
  } catch (error) {
    next(error);
  }
});

// Get leave request by ID (ADMIN, MANAGER)
router.get('/:id', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getLeaveById(req, res);
  } catch (error) {
    next(error);
  }
});

// Get leave requests by employee ID (ADMIN, MANAGER, USER)
router.get('/employee/:employeeId', authorize([Role.ADMIN, Role.MANAGER, Role.USER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getLeavesByEmployee(req, res);
  } catch (error) {
    next(error);
  }
});

// Create leave request (ADMIN, MANAGER, USER)
router.post('/', authorize([Role.ADMIN, Role.MANAGER, Role.USER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await createLeave(req, res);
  } catch (error) {
    next(error);
  }
});

// Update leave request (ADMIN, MANAGER, USER)
router.put('/:id', authorize([Role.ADMIN, Role.MANAGER, Role.USER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await updateLeave(req, res);
  } catch (error) {
    next(error);
  }
});

// Process leave request (approve/reject) (ADMIN, MANAGER)
router.put('/:id/process', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await processLeave(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete leave request (ADMIN, MANAGER)
router.delete('/:id', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteLeave(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 