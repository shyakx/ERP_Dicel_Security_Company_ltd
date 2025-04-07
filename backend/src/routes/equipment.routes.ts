import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  assignEquipment,
  deleteEquipment,
} from '../controllers/equipment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import { roleBasedCors } from '../middleware/cors.middleware';

// Define Role enum since it's not exported from @prisma/client
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply role-based CORS for admin and manager routes
router.use(roleBasedCors([Role.ADMIN, Role.MANAGER]));

// Get all equipment (ADMIN, MANAGER)
router.get('/', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getAllEquipment(req, res);
  } catch (error) {
    next(error);
  }
});

// Get equipment by ID (ADMIN, MANAGER)
router.get('/:id', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getEquipmentById(req, res);
  } catch (error) {
    next(error);
  }
});

// Create equipment (ADMIN)
router.post('/', authorize([Role.ADMIN]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await createEquipment(req, res);
  } catch (error) {
    next(error);
  }
});

// Update equipment (ADMIN)
router.put('/:id', authorize([Role.ADMIN]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await updateEquipment(req, res);
  } catch (error) {
    next(error);
  }
});

// Assign equipment to employee (ADMIN, MANAGER)
router.put('/:id/assign', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await assignEquipment(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete equipment (ADMIN)
router.delete('/:id', authorize([Role.ADMIN]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteEquipment(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 