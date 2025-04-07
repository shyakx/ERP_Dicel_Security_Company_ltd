import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  updateIncidentStatus,
  deleteIncident,
} from '../controllers/incident.controller';
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

// Get all incidents (ADMIN, MANAGER)
router.get('/', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getAllIncidents(req, res);
  } catch (error) {
    next(error);
  }
});

// Get incident by ID (ADMIN, MANAGER)
router.get('/:id', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getIncidentById(req, res);
  } catch (error) {
    next(error);
  }
});

// Create incident (ADMIN, MANAGER, USER)
router.post('/', authorize([Role.ADMIN, Role.MANAGER, Role.USER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await createIncident(req, res);
  } catch (error) {
    next(error);
  }
});

// Update incident (ADMIN, MANAGER)
router.put('/:id', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await updateIncident(req, res);
  } catch (error) {
    next(error);
  }
});

// Update incident status (ADMIN, MANAGER)
router.put('/:id/status', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await updateIncidentStatus(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete incident (ADMIN)
router.delete('/:id', authorize([Role.ADMIN]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteIncident(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 