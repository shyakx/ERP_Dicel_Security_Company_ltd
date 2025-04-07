import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import {
  getAttendanceReport,
  getLeaveReport,
  getPayrollReport,
  getIncidentReport,
  getEquipmentReport,
  getProjectReport
} from '../../controllers/report.controller';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
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
  }
}));

describe('Report Controller Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock
    };
    mockReq = {
      query: {}
    };
  });

  afterEach(() => {
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

    it('should return attendance report in JSON format', async () => {
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendanceData);

      await getAttendanceReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          employeeId: '1',
          employeeName: 'John Doe',
          checkIn: expect.any(String),
          checkOut: expect.any(String),
          duration: expect.any(Number)
        })
      ]));
    });

    it('should handle invalid date format', async () => {
      mockReq.query = { startDate: 'invalid-date' };

      await getAttendanceReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating attendance report',
        error: 'Invalid start date format'
      });
    });

    it('should handle database errors', async () => {
      (prisma.attendance.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getAttendanceReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating attendance report',
        error: expect.any(Error)
      });
    });
  });

  describe('getLeaveReport', () => {
    const mockLeaveData = [
      {
        id: '1',
        employeeId: '1',
        employee: {
          firstName: 'John',
          lastName: 'Doe'
        },
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07'),
        type: 'ANNUAL',
        status: 'APPROVED'
      }
    ];

    it('should return leave report in JSON format', async () => {
      (prisma.leave.findMany as jest.Mock).mockResolvedValue(mockLeaveData);

      await getLeaveReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockLeaveData);
    });

    it('should handle invalid status', async () => {
      mockReq.query = { status: 'INVALID' };

      await getLeaveReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating leave report',
        error: 'Invalid status value'
      });
    });
  });

  describe('getPayrollReport', () => {
    const mockPayrollData = [
      {
        id: '1',
        employeeId: '1',
        employee: {
          firstName: 'John',
          lastName: 'Doe'
        },
        amount: 5000,
        month: 1,
        year: 2024,
        status: 'PAID',
        date: new Date('2024-01-01')
      }
    ];

    it('should return payroll report in JSON format', async () => {
      (prisma.payroll.findMany as jest.Mock).mockResolvedValue(mockPayrollData);

      await getPayrollReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockPayrollData);
    });

    it('should handle invalid status', async () => {
      mockReq.query = { status: 'INVALID' };

      await getPayrollReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating payroll report',
        error: 'Invalid status value'
      });
    });
  });

  describe('getIncidentReport', () => {
    const mockIncidentData = [
      {
        id: '1',
        employeeId: '1',
        employee: {
          firstName: 'John',
          lastName: 'Doe'
        },
        projectId: '1',
        project: {
          name: 'Test Project'
        },
        description: 'Test incident',
        status: 'OPEN',
        date: new Date('2024-01-01')
      }
    ];

    it('should return incident report in JSON format', async () => {
      (prisma.incident.findMany as jest.Mock).mockResolvedValue(mockIncidentData);

      await getIncidentReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockIncidentData);
    });

    it('should handle invalid status', async () => {
      mockReq.query = { status: 'INVALID' };

      await getIncidentReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating incident report',
        error: 'Invalid status value'
      });
    });
  });

  describe('getEquipmentReport', () => {
    const mockEquipmentData = [
      {
        id: '1',
        name: 'Test Equipment',
        type: 'SECURITY',
        status: 'AVAILABLE',
        projectId: '1',
        project: {
          name: 'Test Project'
        }
      }
    ];

    it('should return equipment report in JSON format', async () => {
      (prisma.equipment.findMany as jest.Mock).mockResolvedValue(mockEquipmentData);

      await getEquipmentReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockEquipmentData);
    });

    it('should handle invalid status', async () => {
      mockReq.query = { status: 'INVALID' };

      await getEquipmentReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating equipment report',
        error: 'Invalid status value'
      });
    });
  });

  describe('getProjectReport', () => {
    const mockProjectData = [
      {
        id: '1',
        name: 'Test Project',
        status: 'ACTIVE',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clientId: '1',
        client: {
          name: 'Test Client'
        },
        employees: [],
        equipment: []
      }
    ];

    it('should return project report in JSON format', async () => {
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjectData);

      await getProjectReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockProjectData);
    });

    it('should handle invalid status', async () => {
      mockReq.query = { status: 'INVALID' };

      await getProjectReport(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error generating project report',
        error: 'Invalid status value'
      });
    });
  });
});