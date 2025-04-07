import { Request, Response } from 'express';

// Mock the shared Prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    leave: {
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
  getAllLeaves,
  getLeaveById,
  getLeavesByEmployee,
  createLeave,
  updateLeave,
  processLeave,
  deleteLeave,
} from '../../controllers/leave.controller';

describe('Leave Controller Tests', () => {
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

  describe('getAllLeaves', () => {
    it('should return all leave requests', async () => {
      const mockLeaves = [
        {
          id: '1',
          employeeId: '1',
          startDate: new Date(),
          endDate: new Date(),
          type: 'ANNUAL',
          reason: 'Vacation',
          status: 'PENDING',
          employee: {
            id: '1',
            employeeId: 'EMP001',
            user: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        },
      ];

      prisma.leave.findMany.mockResolvedValue(mockLeaves);

      await getAllLeaves({} as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockLeaves);
    });

    it('should handle database errors', async () => {
      prisma.leave.findMany.mockRejectedValue(new Error('Database error'));

      await getAllLeaves({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching leave requests',
        error: new Error('Database error'),
      });
    });
  });

  describe('getLeaveById', () => {
    it('should return leave request by ID', async () => {
      const mockLeave = {
        id: '1',
        employeeId: '1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'ANNUAL',
        reason: 'Vacation',
        status: 'PENDING',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };

      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      mockReq = { params: { id: '1' } };

      await getLeaveById(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockLeave);
    });

    it('should return 404 if leave request not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);
      mockReq = { params: { id: '1' } };

      await getLeaveById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Leave request not found' });
    });

    it('should handle database errors', async () => {
      prisma.leave.findUnique.mockRejectedValue(new Error('Database error'));
      mockReq = { params: { id: '1' } };

      await getLeaveById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching leave request',
        error: new Error('Database error'),
      });
    });
  });

  describe('getLeavesByEmployee', () => {
    it('should return leave requests for an employee', async () => {
      const mockLeaves = [
        {
          id: '1',
          employeeId: '1',
          startDate: new Date(),
          endDate: new Date(),
          type: 'ANNUAL',
          reason: 'Vacation',
          status: 'PENDING',
        },
      ];

      prisma.employee.findUnique.mockResolvedValue({ id: '1' });
      prisma.leave.findMany.mockResolvedValue(mockLeaves);
      mockReq = { 
        params: { employeeId: '1' },
        query: {},
      };

      await getLeavesByEmployee(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockLeaves);
    });

    it('should return 404 if employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      mockReq = { 
        params: { employeeId: '1' },
        query: {},
      };

      await getLeavesByEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Employee not found' });
    });

    it('should handle database errors', async () => {
      prisma.employee.findUnique.mockRejectedValue(new Error('Database error'));
      mockReq = { 
        params: { employeeId: '1' },
        query: {},
      };

      await getLeavesByEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching leave requests',
        error: new Error('Database error'),
      });
    });
  });

  describe('createLeave', () => {
    it('should create a new leave request', async () => {
      const mockEmployee = {
        id: '1',
        employeeId: 'EMP001',
      };

      const mockLeave = {
        id: '1',
        employeeId: '1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'ANNUAL',
        reason: 'Vacation',
        status: 'PENDING',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };

      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.leave.findFirst.mockResolvedValue(null);
      prisma.leave.create.mockResolvedValue(mockLeave);

      mockReq = {
        body: {
          employeeId: '1',
          startDate: new Date(),
          endDate: new Date(),
          type: 'ANNUAL',
          reason: 'Vacation',
        },
      };

      await createLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockLeave);
    });

    it('should return 404 if employee not found', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      mockReq = {
        body: {
          employeeId: '1',
          startDate: new Date(),
          endDate: new Date(),
          type: 'ANNUAL',
          reason: 'Vacation',
        },
      };

      await createLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Employee not found' });
    });

    it('should return 400 if overlapping leave exists', async () => {
      const mockEmployee = {
        id: '1',
        employeeId: 'EMP001',
      };

      prisma.employee.findUnique.mockResolvedValue(mockEmployee);
      prisma.leave.findFirst.mockResolvedValue({
        id: '1',
        employeeId: '1',
        status: 'PENDING',
      });

      mockReq = {
        body: {
          employeeId: '1',
          startDate: new Date(),
          endDate: new Date(),
          type: 'ANNUAL',
          reason: 'Vacation',
        },
      };

      await createLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Employee already has a pending leave request for this period',
      });
    });

    it('should handle database errors', async () => {
      prisma.employee.findUnique.mockRejectedValue(new Error('Database error'));

      mockReq = {
        body: {
          employeeId: '1',
          startDate: new Date(),
          endDate: new Date(),
          type: 'ANNUAL',
          reason: 'Vacation',
        },
      };

      await createLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error creating leave request',
        error: new Error('Database error'),
      });
    });
  });

  describe('updateLeave', () => {
    it('should update a leave request', async () => {
      const mockLeave = {
        id: '1',
        employeeId: '1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'ANNUAL',
        reason: 'Vacation',
        status: 'PENDING',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };

      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.update.mockResolvedValue(mockLeave);

      mockReq = {
        params: { id: '1' },
        body: {
          startDate: new Date(),
          endDate: new Date(),
          type: 'SICK',
          reason: 'Illness',
        },
      };

      await updateLeave(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockLeave);
    });

    it('should return 404 if leave request not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);

      mockReq = {
        params: { id: '1' },
        body: {
          startDate: new Date(),
          endDate: new Date(),
          type: 'SICK',
          reason: 'Illness',
        },
      };

      await updateLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Leave request not found' });
    });

    it('should return 400 if leave request is not pending', async () => {
      const mockLeave = {
        id: '1',
        status: 'APPROVED',
      };

      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      mockReq = {
        params: { id: '1' },
        body: {
          startDate: new Date(),
          endDate: new Date(),
          type: 'SICK',
          reason: 'Illness',
        },
      };

      await updateLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Cannot update leave request that has already been processed',
      });
    });

    it('should handle database errors', async () => {
      prisma.leave.findUnique.mockRejectedValue(new Error('Database error'));

      mockReq = {
        params: { id: '1' },
        body: {
          startDate: new Date(),
          endDate: new Date(),
          type: 'SICK',
          reason: 'Illness',
        },
      };

      await updateLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating leave request',
        error: new Error('Database error'),
      });
    });
  });

  describe('processLeave', () => {
    it('should approve a leave request', async () => {
      const mockLeave = {
        id: '1',
        employeeId: '1',
        startDate: new Date(),
        endDate: new Date(),
        type: 'ANNUAL',
        reason: 'Vacation',
        status: 'PENDING',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };

      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.update.mockResolvedValue({
        ...mockLeave,
        status: 'APPROVED',
        approvedBy: '1',
      });

      mockReq = {
        params: { id: '1' },
        body: {
          status: 'APPROVED',
          approvedBy: '1',
        },
      };

      await processLeave(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        ...mockLeave,
        status: 'APPROVED',
        approvedBy: '1',
      });
    });

    it('should return 404 if leave request not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);

      mockReq = {
        params: { id: '1' },
        body: {
          status: 'APPROVED',
          approvedBy: '1',
        },
      };

      await processLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Leave request not found' });
    });

    it('should handle database errors', async () => {
      prisma.leave.findUnique.mockRejectedValue(new Error('Database error'));

      mockReq = {
        params: { id: '1' },
        body: {
          status: 'APPROVED',
          approvedBy: '1',
        },
      };

      await processLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error processing leave request',
        error: new Error('Database error'),
      });
    });
  });

  describe('deleteLeave', () => {
    it('should delete a leave request', async () => {
      const mockLeave = {
        id: '1',
        status: 'PENDING',
      };

      prisma.leave.findUnique.mockResolvedValue(mockLeave);
      prisma.leave.delete.mockResolvedValue(mockLeave);

      mockReq = { params: { id: '1' } };

      await deleteLeave(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ message: 'Leave request deleted successfully' });
    });

    it('should return 404 if leave request not found', async () => {
      prisma.leave.findUnique.mockResolvedValue(null);

      mockReq = { params: { id: '1' } };

      await deleteLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Leave request not found' });
    });

    it('should return 400 if leave request is not pending', async () => {
      const mockLeave = {
        id: '1',
        status: 'APPROVED',
      };

      prisma.leave.findUnique.mockResolvedValue(mockLeave);

      mockReq = { params: { id: '1' } };

      await deleteLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Cannot delete leave request that has already been processed',
      });
    });

    it('should handle database errors', async () => {
      prisma.leave.findUnique.mockRejectedValue(new Error('Database error'));

      mockReq = { params: { id: '1' } };

      await deleteLeave(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error deleting leave request',
        error: new Error('Database error'),
      });
    });
  });
}); 