import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

// Mock the Prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    payroll: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
  },
}));

import {
  getAllPayrolls,
  getPayrollById,
  getPayrollsByEmployeeId,
  createPayroll,
  updatePayroll,
  updatePayrollStatus,
  deletePayroll,
} from '../../controllers/payroll.controller';

describe('Payroll Controller Tests', () => {
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

  describe('getAllPayrolls', () => {
    it('should return all payroll records', async () => {
      const mockPayrolls = [
        {
          id: '1',
          employeeId: '1',
          amount: 5000,
          month: 1,
          year: 2024,
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

      (prisma.payroll.findMany as jest.Mock).mockResolvedValue(mockPayrolls);

      await getAllPayrolls({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockPayrolls);
    });

    it('should handle database errors', async () => {
      (prisma.payroll.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getAllPayrolls({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching payrolls',
        error: expect.any(Error),
      });
    });
  });

  describe('getPayrollById', () => {
    it('should return payroll by ID', async () => {
      const mockPayroll = {
        id: '1',
        employeeId: '1',
        amount: 5000,
        month: 1,
        year: 2024,
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

      (prisma.payroll.findUnique as jest.Mock).mockResolvedValue(mockPayroll);
      mockReq = { params: { id: '1' } };

      await getPayrollById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockPayroll);
    });

    it('should return 404 if payroll not found', async () => {
      (prisma.payroll.findUnique as jest.Mock).mockResolvedValue(null);
      mockReq = { params: { id: '1' } };

      await getPayrollById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Payroll not found' });
    });

    it('should handle database errors', async () => {
      (prisma.payroll.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = { params: { id: '1' } };

      await getPayrollById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching payroll',
        error: expect.any(Error),
      });
    });
  });

  describe('getPayrollsByEmployeeId', () => {
    it('should return payrolls for an employee', async () => {
      const mockPayrolls = [
        {
          id: '1',
          employeeId: '1',
          amount: 5000,
          month: 1,
          year: 2024,
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

      (prisma.payroll.findMany as jest.Mock).mockResolvedValue(mockPayrolls);
      mockReq = { params: { employeeId: '1' } };

      await getPayrollsByEmployeeId(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockPayrolls);
    });

    it('should handle database errors', async () => {
      (prisma.payroll.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = { params: { employeeId: '1' } };

      await getPayrollsByEmployeeId(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching payrolls',
        error: expect.any(Error),
      });
    });
  });

  describe('createPayroll', () => {
    it('should create a new payroll', async () => {
      const mockPayroll = {
        id: '1',
        employeeId: '1',
        amount: 5000,
        month: 1,
        year: 2024,
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

      (prisma.payroll.create as jest.Mock).mockResolvedValue(mockPayroll);
      mockReq = {
        body: {
          employeeId: '1',
          amount: 5000,
          month: 1,
          year: 2024,
        },
      };

      await createPayroll(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockPayroll);
    });

    it('should handle database errors', async () => {
      (prisma.payroll.create as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        body: {
          employeeId: '1',
          amount: 5000,
          month: 1,
          year: 2024,
        },
      };

      await createPayroll(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error creating payroll',
        error: expect.any(Error),
      });
    });
  });

  describe('updatePayroll', () => {
    it('should update a payroll', async () => {
      const mockPayroll = {
        id: '1',
        employeeId: '1',
        amount: 6000,
        month: 2,
        year: 2024,
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

      (prisma.payroll.update as jest.Mock).mockResolvedValue(mockPayroll);
      mockReq = {
        params: { id: '1' },
        body: {
          amount: 6000,
          month: 2,
          year: 2024,
        },
      };

      await updatePayroll(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockPayroll);
    });

    it('should handle database errors', async () => {
      (prisma.payroll.update as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        params: { id: '1' },
        body: {
          amount: 6000,
          month: 2,
          year: 2024,
        },
      };

      await updatePayroll(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating payroll',
        error: expect.any(Error),
      });
    });
  });

  describe('updatePayrollStatus', () => {
    it('should update payroll status', async () => {
      const mockPayroll = {
        id: '1',
        employeeId: '1',
        amount: 5000,
        month: 1,
        year: 2024,
        status: 'PAID',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      };

      (prisma.payroll.update as jest.Mock).mockResolvedValue(mockPayroll);
      mockReq = {
        params: { id: '1' },
        body: { status: 'PAID' },
      };

      await updatePayrollStatus(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockPayroll);
    });

    it('should handle database errors', async () => {
      (prisma.payroll.update as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        params: { id: '1' },
        body: { status: 'PAID' },
      };

      await updatePayrollStatus(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating payroll status',
        error: expect.any(Error),
      });
    });
  });

  describe('deletePayroll', () => {
    it('should delete a payroll', async () => {
      (prisma.payroll.delete as jest.Mock).mockResolvedValue({});
      mockReq = { params: { id: '1' } };

      await deletePayroll(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it('should handle database errors', async () => {
      (prisma.payroll.delete as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = { params: { id: '1' } };

      await deletePayroll(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error deleting payroll',
        error: expect.any(Error),
      });
    });
  });
}); 