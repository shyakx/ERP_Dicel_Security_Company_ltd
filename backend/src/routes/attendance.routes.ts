import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllAttendance,
  getAttendanceById,
  getAttendanceByEmployee,
  checkIn,
  checkOut,
  updateAttendanceStatus,
} from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

// Define Role enum since it's not exported from @prisma/client
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - employeeId
 *         - checkInTime
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the attendance record
 *         employeeId:
 *           type: string
 *           description: The ID of the employee
 *         checkInTime:
 *           type: string
 *           format: date-time
 *           description: The time when the employee checked in
 *         checkOutTime:
 *           type: string
 *           format: date-time
 *           description: The time when the employee checked out
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 *           description: The attendance status
 *         location:
 *           type: string
 *           description: The location where the attendance was recorded
 *         notes:
 *           type: string
 *           description: Any additional notes about the attendance
 */

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Employee attendance management endpoints
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getAllAttendance(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/attendance/{id}:
 *   get:
 *     summary: Get attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getAttendanceById(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/attendance/employee/{employeeId}:
 *   get:
 *     summary: Get attendance records by employee ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: List of employee's attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Server error
 */
router.get('/employee/:employeeId', authorize([Role.ADMIN, Role.MANAGER, Role.USER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await getAttendanceByEmployee(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/attendance/check-in:
 *   post:
 *     summary: Record employee check-in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - location
 *             properties:
 *               employeeId:
 *                 type: string
 *               location:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Check-in recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input or already checked in
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/check-in', authorize([Role.ADMIN, Role.MANAGER, Role.USER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await checkIn(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/attendance/{id}/check-out:
 *   put:
 *     summary: Record employee check-out
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Check-out recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input or already checked out
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server error
 */
router.put('/:id/check-out', authorize([Role.ADMIN, Role.MANAGER, Role.USER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await checkOut(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/attendance/{id}/status:
 *   put:
 *     summary: Update attendance status
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', authorize([Role.ADMIN, Role.MANAGER]), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await updateAttendanceStatus(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 