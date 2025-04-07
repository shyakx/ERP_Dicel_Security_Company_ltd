import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';
import {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getIncidentReport,
  getEquipmentReport,
  getProjectReport,
} from '../controllers/report.controller';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Define Role enum
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

// Attendance Report Routes
router.get('/attendance', authorize([Role.ADMIN, Role.MANAGER]), (req: Request, res: Response, next: NextFunction) => {
  getAttendanceReport(req, res).catch(next);
});

// Leave Report Routes
router.get('/leave', authorize([Role.ADMIN, Role.MANAGER]), (req: Request, res: Response, next: NextFunction) => {
  getLeaveReport(req, res).catch(next);
});

// Payroll Report Routes
router.get('/payroll', authorize([Role.ADMIN, Role.MANAGER]), (req: Request, res: Response, next: NextFunction) => {
  getPayrollReport(req, res).catch(next);
});

// Incident Report Routes
router.get('/incident', authorize([Role.ADMIN, Role.MANAGER]), (req: Request, res: Response, next: NextFunction) => {
  getIncidentReport(req, res).catch(next);
});

// Equipment Report Routes
router.get('/equipment', authorize([Role.ADMIN, Role.MANAGER]), (req: Request, res: Response, next: NextFunction) => {
  getEquipmentReport(req, res).catch(next);
});

// Project Report Routes
router.get('/project', authorize([Role.ADMIN, Role.MANAGER]), (req: Request, res: Response, next: NextFunction) => {
  getProjectReport(req, res).catch(next);
});

export default router; 