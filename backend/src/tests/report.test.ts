import { Request, Response } from 'express';

// Create a mock Prisma client instance
const mockPrismaClient = {
  attendance: {
    findMany: jest.fn()
  },
  leave: {
    findMany: jest.fn()
  },
  payroll: {
    findMany: jest.fn()
  },
  incident: {
    findMany: jest.fn()
  },
  equipment: {
    findMany: jest.fn()
  },
  project: {
    findMany: jest.fn()
  }
};

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

// Mock export utils
jest.mock('../utils/export.utils', () => ({
  handleExport: jest.fn().mockImplementation((data, format, filename, res, options) => {
    res.status(200).json({ data, format, filename, options });
  })
}));

// Import the controller after mocking dependencies
const { 
  getAttendanceReport, 
  getLeaveReport, 
  getPayrollReport, 
  getIncidentReport, 
  getEquipmentReport, 
  getProjectReport 
} = require('../controllers/report.controller');

describe('Report Controller Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let handleExport: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockRes = {
      json: jsonMock,
      status: statusMock
    };
    handleExport = require('../utils/export.utils').handleExport;
    jest.clearAllMocks();
  });

  describe('getAttendanceReport', () => {
    const mockAttendanceData = [
      {
        employeeId: '1',
        employee: {
          firstName: 'John',
          lastName: 'Doe'
        },
        checkIn: new Date('2024-01-01T09:00:00Z'),
        checkOut: new Date('2024-01-01T17:00:00Z')
      }
    ];

    it('should handle database query errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrismaClient.attendance.findMany.mockRejectedValueOnce(dbError);
      mockReq = {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      };

      await getAttendanceReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating attendance report',
        error: dbError
      });
    });

    it('should validate date formats', async () => {
      mockReq = {
        query: {
          startDate: 'invalid-date',
          endDate: '2024-01-31'
        }
      };

      await getAttendanceReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating attendance report',
        error: 'Invalid start date format'
      });
    });

    it('should validate export format', async () => {
      mockReq = {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'invalid-format'
        }
      };

      await getAttendanceReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating attendance report',
        error: 'Invalid export format'
      });
    });

    it('should return attendance data in JSON format', async () => {
      mockPrismaClient.attendance.findMany.mockResolvedValueOnce(mockAttendanceData);
      mockReq = {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      };

      await getAttendanceReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith([
        {
          employeeId: '1',
          employeeName: 'John Doe',
          checkIn: expect.any(String),
          checkOut: expect.any(String),
          duration: 8
        }
      ]);
    });

    it('should handle export to different formats', async () => {
      mockPrismaClient.attendance.findMany.mockResolvedValueOnce(mockAttendanceData);
      mockReq = {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'csv'
        }
      };

      await getAttendanceReport(mockReq as Request, mockRes as Response);
      expect(handleExport).toHaveBeenCalledWith(
        expect.any(Array),
        'csv',
        'attendance-report',
        mockRes,
        expect.any(Object)
      );
    });
  });

  describe('getLeaveReport', () => {
    const mockLeaveData = [
      {
        id: '1',
        employee: {
          firstName: 'John',
          lastName: 'Doe'
        },
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        type: 'ANNUAL',
        status: 'APPROVED'
      }
    ];

    it('should validate leave status', async () => {
      mockReq = {
        query: {
          status: 'INVALID_STATUS'
        }
      };

      await getLeaveReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating leave report',
        error: 'Invalid status value'
      });
    });

    it('should return leave data in JSON format', async () => {
      mockPrismaClient.leave.findMany.mockResolvedValueOnce(mockLeaveData);
      mockReq = {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      };

      await getLeaveReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockLeaveData);
    });
  });

  describe('getPayrollReport', () => {
    const mockPayrollData = [
      {
        id: '1',
        employee: {
          firstName: 'John',
          lastName: 'Doe'
        },
        amount: 5000,
        month: 'JANUARY',
        year: 2024,
        status: 'PAID'
      }
    ];

    it('should validate payroll status', async () => {
      mockReq = {
        query: {
          status: 'INVALID_STATUS'
        }
      };

      await getPayrollReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating payroll report',
        error: 'Invalid status value'
      });
    });

    it('should return payroll data in JSON format', async () => {
      mockPrismaClient.payroll.findMany.mockResolvedValueOnce(mockPayrollData);
      mockReq = {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      };

      await getPayrollReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockPayrollData);
    });
  });

  describe('getIncidentReport', () => {
    const mockIncidentData = [
      {
        id: '1',
        employee: {
          firstName: 'John',
          lastName: 'Doe'
        },
        project: {
          name: 'Project A'
        },
        description: 'Test incident',
        status: 'OPEN',
        date: new Date('2024-01-01')
      }
    ];

    it('should validate incident status', async () => {
      mockReq = {
        query: {
          status: 'INVALID_STATUS'
        }
      };

      await getIncidentReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating incident report',
        error: 'Invalid status value'
      });
    });

    it('should return incident data in JSON format', async () => {
      mockPrismaClient.incident.findMany.mockResolvedValueOnce(mockIncidentData);
      mockReq = {
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }
      };

      await getIncidentReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockIncidentData);
    });
  });

  describe('getEquipmentReport', () => {
    const mockEquipmentData = [
      {
        id: '1',
        name: 'Laptop',
        type: 'ELECTRONICS',
        status: 'AVAILABLE',
        project: {
          name: 'Project A'
        }
      }
    ];

    it('should validate equipment status', async () => {
      mockReq = {
        query: {
          status: 'INVALID_STATUS'
        }
      };

      await getEquipmentReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating equipment report',
        error: 'Invalid status value'
      });
    });

    it('should return equipment data in JSON format', async () => {
      mockPrismaClient.equipment.findMany.mockResolvedValueOnce(mockEquipmentData);
      mockReq = {
        query: {}
      };

      await getEquipmentReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockEquipmentData);
    });
  });

  describe('getProjectReport', () => {
    const mockProjectData = [
      {
        id: '1',
        name: 'Project A',
        client: {
          name: 'Client A'
        },
        status: 'ACTIVE',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        employees: [],
        equipment: []
      }
    ];

    it('should validate project status', async () => {
      mockReq = {
        query: {
          status: 'INVALID_STATUS'
        }
      };

      await getProjectReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating project report',
        error: 'Invalid status value'
      });
    });

    it('should return project data in JSON format', async () => {
      mockPrismaClient.project.findMany.mockResolvedValueOnce(mockProjectData);
      mockReq = {
        query: {}
      };

      await getProjectReport(mockReq as Request, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockProjectData);
    });
  });
});