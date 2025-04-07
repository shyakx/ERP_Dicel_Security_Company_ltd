import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

// Mock the Prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    incident: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  },
}));

import {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  updateIncidentStatus,
  deleteIncident,
} from '../../controllers/incident.controller';

describe('Incident Controller Tests', () => {
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

  describe('getAllIncidents', () => {
    it('should return all incidents', async () => {
      const mockIncidents = [
        {
          id: '1',
          employeeId: '1',
          projectId: '1',
          description: 'Test incident',
          severity: 'HIGH',
          status: 'OPEN',
          employee: {
            id: '1',
            employeeId: 'EMP001',
            user: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
          project: {
            id: '1',
            name: 'Test Project',
          },
        },
      ];

      (prisma.incident.findMany as jest.Mock).mockResolvedValue(mockIncidents);

      await getAllIncidents({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockIncidents);
    });

    it('should handle database errors', async () => {
      (prisma.incident.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getAllIncidents({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching incidents',
        error: expect.any(Error),
      });
    });
  });

  describe('getIncidentById', () => {
    it('should return incident by ID', async () => {
      const mockIncident = {
        id: '1',
        employeeId: '1',
        projectId: '1',
        description: 'Test incident',
        severity: 'HIGH',
        status: 'OPEN',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        project: {
          id: '1',
          name: 'Test Project',
        },
      };

      (prisma.incident.findUnique as jest.Mock).mockResolvedValue(mockIncident);
      mockReq = { params: { id: '1' } };

      await getIncidentById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockIncident);
    });

    it('should return 404 if incident not found', async () => {
      (prisma.incident.findUnique as jest.Mock).mockResolvedValue(null);
      mockReq = { params: { id: '1' } };

      await getIncidentById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Incident not found' });
    });

    it('should handle database errors', async () => {
      (prisma.incident.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = { params: { id: '1' } };

      await getIncidentById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching incident',
        error: expect.any(Error),
      });
    });
  });

  describe('createIncident', () => {
    it('should create a new incident', async () => {
      const mockIncident = {
        id: '1',
        employeeId: '1',
        projectId: '1',
        description: 'Test incident',
        severity: 'HIGH',
        status: 'OPEN',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        project: {
          id: '1',
          name: 'Test Project',
        },
      };

      (prisma.incident.create as jest.Mock).mockResolvedValue(mockIncident);
      mockReq = {
        body: {
          employeeId: '1',
          projectId: '1',
          description: 'Test incident',
          severity: 'HIGH',
          status: 'OPEN',
        },
      };

      await createIncident(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockIncident);
    });

    it('should handle database errors', async () => {
      (prisma.incident.create as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        body: {
          employeeId: '1',
          projectId: '1',
          description: 'Test incident',
          severity: 'HIGH',
          status: 'OPEN',
        },
      };

      await createIncident(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error creating incident',
        error: expect.any(Error),
      });
    });
  });

  describe('updateIncident', () => {
    it('should update an incident', async () => {
      const mockIncident = {
        id: '1',
        employeeId: '1',
        projectId: '1',
        description: 'Updated incident',
        severity: 'MEDIUM',
        status: 'IN_PROGRESS',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        project: {
          id: '1',
          name: 'Test Project',
        },
      };

      (prisma.incident.update as jest.Mock).mockResolvedValue(mockIncident);
      mockReq = {
        params: { id: '1' },
        body: {
          description: 'Updated incident',
          severity: 'MEDIUM',
          status: 'IN_PROGRESS',
        },
      };

      await updateIncident(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockIncident);
    });

    it('should handle database errors', async () => {
      (prisma.incident.update as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        params: { id: '1' },
        body: {
          description: 'Updated incident',
          severity: 'MEDIUM',
          status: 'IN_PROGRESS',
        },
      };

      await updateIncident(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating incident',
        error: expect.any(Error),
      });
    });
  });

  describe('updateIncidentStatus', () => {
    it('should update incident status', async () => {
      const mockIncident = {
        id: '1',
        employeeId: '1',
        projectId: '1',
        description: 'Test incident',
        severity: 'HIGH',
        status: 'CLOSED',
        employee: {
          id: '1',
          employeeId: 'EMP001',
          user: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
        project: {
          id: '1',
          name: 'Test Project',
        },
      };

      (prisma.incident.update as jest.Mock).mockResolvedValue(mockIncident);
      mockReq = {
        params: { id: '1' },
        body: { status: 'CLOSED' },
      };

      await updateIncidentStatus(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockIncident);
    });

    it('should handle database errors', async () => {
      (prisma.incident.update as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        params: { id: '1' },
        body: { status: 'CLOSED' },
      };

      await updateIncidentStatus(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating incident status',
        error: expect.any(Error),
      });
    });
  });

  describe('deleteIncident', () => {
    it('should delete an incident', async () => {
      (prisma.incident.delete as jest.Mock).mockResolvedValue({});
      mockReq = { params: { id: '1' } };

      await deleteIncident(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(204);
    });

    it('should handle database errors', async () => {
      (prisma.incident.delete as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = { params: { id: '1' } };

      await deleteIncident(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error deleting incident',
        error: expect.any(Error),
      });
    });
  });
}); 