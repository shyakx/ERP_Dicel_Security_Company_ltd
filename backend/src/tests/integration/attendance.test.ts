import { Request, Response } from 'express';

// Mock the shared Prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    attendance: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from '../../lib/prisma';
import {
  getAllAttendance,
  getAttendanceById,
  checkIn,
  checkOut,
  updateAttendanceStatus,
} from '../../controllers/attendance.controller';

describe('Attendance Controller Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    jest.clearAllMocks();
  });

  describe('getAllAttendance', () => {
    it('should return all attendance records', async () => {
      const mockAttendance = [
        {
          id: '1',
          employeeId: '1',
          checkIn: new Date(),
          checkOut: null,
          status: 'PRESENT',
          employee: {
            id: '1',
            employeeId: 'EMP001',
            department: 'IT',
            position: 'Developer',
            user: {
              firstName: 'John',
              lastName: 'Doe',
            }
          },
        },
      ];

      prisma.attendance.findMany.mockResolvedValue(mockAttendance);

      await getAllAttendance({} as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockAttendance);
    });

    it('should handle database errors', async () => {
      prisma.attendance.findMany.mockRejectedValue(new Error('Database error'));

      await getAllAttendance({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching attendance records',
        error: new Error('Database error'),
      });
    });
  });

  describe('getAttendanceById', () => {
    it('should return attendance by ID', async () => {
      const mockAttendance = {
        id: '1',
        employeeId: '1',
        checkIn: new Date(),
        checkOut: null,
        status: 'PRESENT',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          department: 'IT',
          position: 'Developer',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          }
        },
      };

      prisma.attendance.findUnique.mockResolvedValue(mockAttendance);
      mockReq = { params: { id: '1' } };

      await getAttendanceById(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockAttendance);
    });

    it('should return 404 if attendance not found', async () => {
      prisma.attendance.findUnique.mockResolvedValue(null);
      mockReq = { params: { id: '1' } };

      await getAttendanceById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Attendance record not found' });
    });

    it('should handle database errors', async () => {
      prisma.attendance.findUnique.mockRejectedValue(new Error('Database error'));
      mockReq = { params: { id: '1' } };

      await getAttendanceById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching attendance record',
        error: new Error('Database error'),
      });
    });
  });

  describe('checkIn', () => {
    it('should create a new attendance record', async () => {
      const mockEmployee = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP001',
      };

      const mockAttendance = {
        id: '1',
        employeeId: '1',
        date: new Date(),
        checkIn: new Date(),
        location: 'Office',
        status: 'PRESENT',
        employee: mockEmployee,
      };

      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.attendance.findFirst.mockResolvedValue(null);
      prisma.attendance.create.mockResolvedValue(mockAttendance);

      mockReq = {
        body: {
          employeeId: '1',
          location: 'Office',
        },
      };

      await checkIn(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockAttendance);
    });

    it('should return 404 if employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      mockReq = {
        body: {
          employeeId: '1',
          location: 'Office',
        },
      };

      await checkIn(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Employee not found' });
    });

    it('should handle database errors', async () => {
      prisma.employee.findUnique.mockRejectedValue(new Error('Database error'));

      mockReq = {
        body: {
          employeeId: '1',
          location: 'Office',
        },
      };

      await checkIn(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error checking in',
        error: new Error('Database error'),
      });
    });
  });

  describe('checkOut', () => {
    it('should update an existing attendance record', async () => {
      const mockAttendance = {
        id: '1',
        employeeId: '1',
        date: new Date(),
        checkIn: new Date(),
        checkOut: null,
      };

      const mockUpdatedAttendance = {
        ...mockAttendance,
        checkOut: new Date(),
        checkOutLocation: 'Office',
      };

      prisma.attendance.findFirst.mockResolvedValue(mockAttendance);
      prisma.attendance.update.mockResolvedValue(mockUpdatedAttendance);

      mockReq = {
        body: {
          employeeId: '1',
          location: 'Office',
        },
      };

      await checkOut(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockUpdatedAttendance);
    });

    it('should return 404 if no check-in record found', async () => {
      prisma.attendance.findFirst.mockResolvedValue(null);

      mockReq = {
        body: {
          employeeId: '1',
          location: 'Office',
        },
      };

      await checkOut(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'No check-in record found for today' });
    });

    it('should handle database errors', async () => {
      prisma.attendance.findFirst.mockRejectedValue(new Error('Database error'));

      mockReq = {
        body: {
          employeeId: '1',
          location: 'Office',
        },
      };

      await checkOut(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error checking out',
        error: new Error('Database error'),
      });
    });
  });

  describe('updateAttendanceStatus', () => {
    it('should update attendance status', async () => {
      const mockAttendance = {
        id: '1',
        employeeId: '1',
        date: new Date(),
        status: 'PRESENT',
      };

      prisma.attendance.findUnique.mockResolvedValue(mockAttendance);
      prisma.attendance.update.mockResolvedValue({
        ...mockAttendance,
        status: 'ABSENT',
      });

      mockReq = {
        params: { id: '1' },
        body: { status: 'ABSENT' },
      };

      await updateAttendanceStatus(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        ...mockAttendance,
        status: 'ABSENT',
      });
    });

    it('should return 404 if attendance record not found', async () => {
      prisma.attendance.findUnique.mockResolvedValue(null);

      mockReq = {
        params: { id: '1' },
        body: { status: 'ABSENT' },
      };

      await updateAttendanceStatus(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Attendance record not found' });
    });

    it('should handle database errors', async () => {
      prisma.attendance.findUnique.mockRejectedValue(new Error('Database error'));

      mockReq = {
        params: { id: '1' },
        body: { status: 'ABSENT' },
      };

      await updateAttendanceStatus(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating attendance status',
        error: new Error('Database error'),
      });
    });
  });
}); 