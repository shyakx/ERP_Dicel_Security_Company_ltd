import { Request, Response } from 'express';
import prisma from '../../lib/prisma';

// Mock the Prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    equipment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
  },
}));

import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  assignEquipment,
  deleteEquipment,
} from '../../controllers/equipment.controller';

describe('Equipment Controller Tests', () => {
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

  describe('getAllEquipment', () => {
    it('should return all equipment', async () => {
      const mockEquipment = [
        {
          id: '1',
          name: 'Test Equipment',
          type: 'CAMERA',
          serialNumber: 'SN123',
          status: 'AVAILABLE',
          projectId: '1',
          project: {
            id: '1',
            name: 'Test Project',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.equipment.findMany as jest.Mock).mockResolvedValue(mockEquipment);

      await getAllEquipment({} as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockEquipment);
    });

    it('should handle database errors', async () => {
      (prisma.equipment.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getAllEquipment({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching equipment',
        error: expect.any(Error),
      });
    });
  });

  describe('getEquipmentById', () => {
    it('should return equipment by ID', async () => {
      const mockEquipment = {
        id: '1',
        name: 'Test Equipment',
        type: 'CAMERA',
        serialNumber: 'SN123',
        status: 'AVAILABLE',
        projectId: '1',
        project: {
          id: '1',
          name: 'Test Project',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue(mockEquipment);
      mockReq = { params: { id: '1' } };

      await getEquipmentById(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockEquipment);
    });

    it('should return 404 if equipment not found', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue(null);
      mockReq = { params: { id: '1' } };

      await getEquipmentById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Equipment not found' });
    });

    it('should handle database errors', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = { params: { id: '1' } };

      await getEquipmentById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching equipment',
        error: expect.any(Error),
      });
    });
  });

  describe('createEquipment', () => {
    it('should create a new equipment', async () => {
      const mockEquipment = {
        id: '1',
        name: 'Test Equipment',
        type: 'CAMERA',
        serialNumber: 'SN123',
        status: 'AVAILABLE',
        projectId: '1',
        project: {
          id: '1',
          name: 'Test Project',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.equipment.create as jest.Mock).mockResolvedValue(mockEquipment);
      mockReq = {
        body: {
          name: 'Test Equipment',
          type: 'CAMERA',
          serialNumber: 'SN123',
          status: 'AVAILABLE',
          projectId: '1',
        },
      };

      await createEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockEquipment);
    });

    it('should handle database errors', async () => {
      (prisma.equipment.create as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        body: {
          name: 'Test Equipment',
          type: 'CAMERA',
          serialNumber: 'SN123',
          status: 'AVAILABLE',
          projectId: '1',
        },
      };

      await createEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error creating equipment',
        error: expect.any(Error),
      });
    });
  });

  describe('updateEquipment', () => {
    it('should update an equipment', async () => {
      const mockEquipment = {
        id: '1',
        name: 'Updated Equipment',
        type: 'SENSOR',
        serialNumber: 'SN456',
        status: 'MAINTENANCE',
        projectId: '1',
        project: {
          id: '1',
          name: 'Test Project',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      (prisma.equipment.update as jest.Mock).mockResolvedValue(mockEquipment);
      mockReq = {
        params: { id: '1' },
        body: {
          name: 'Updated Equipment',
          type: 'SENSOR',
          serialNumber: 'SN456',
          status: 'MAINTENANCE',
          projectId: '1',
        },
      };

      await updateEquipment(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockEquipment);
    });

    it('should return 404 if equipment not found', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue(null);
      mockReq = {
        params: { id: '1' },
        body: {
          name: 'Updated Equipment',
          type: 'SENSOR',
          serialNumber: 'SN456',
          status: 'MAINTENANCE',
          projectId: '1',
        },
      };

      await updateEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Equipment not found' });
    });

    it('should handle database errors', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        params: { id: '1' },
        body: {
          name: 'Updated Equipment',
          type: 'SENSOR',
          serialNumber: 'SN456',
          status: 'MAINTENANCE',
          projectId: '1',
        },
      };

      await updateEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating equipment',
        error: expect.any(Error),
      });
    });
  });

  describe('assignEquipment', () => {
    it('should assign equipment to a project', async () => {
      const mockEquipment = {
        id: '1',
        name: 'Test Equipment',
        type: 'CAMERA',
        serialNumber: 'SN123',
        status: 'ASSIGNED',
        projectId: '1',
        project: {
          id: '1',
          name: 'Test Project',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Test Project' });
      (prisma.equipment.update as jest.Mock).mockResolvedValue(mockEquipment);
      mockReq = {
        params: { id: '1' },
        body: { projectId: '1' },
      };

      await assignEquipment(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockEquipment);
    });

    it('should return 404 if equipment not found', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue(null);
      mockReq = {
        params: { id: '1' },
        body: { projectId: '1' },
      };

      await assignEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Equipment not found' });
    });

    it('should return 404 if project not found', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
      mockReq = {
        params: { id: '1' },
        body: { projectId: '1' },
      };

      await assignEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should handle database errors', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = {
        params: { id: '1' },
        body: { projectId: '1' },
      };

      await assignEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error assigning equipment',
        error: expect.any(Error),
      });
    });
  });

  describe('deleteEquipment', () => {
    it('should delete an equipment', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: null });
      (prisma.equipment.delete as jest.Mock).mockResolvedValue({});
      mockReq = { params: { id: '1' } };

      await deleteEquipment(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ message: 'Equipment deleted successfully' });
    });

    it('should return 404 if equipment not found', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue(null);
      mockReq = { params: { id: '1' } };

      await deleteEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Equipment not found' });
    });

    it('should return 400 if equipment is assigned to a project', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockResolvedValue({ id: '1', projectId: '1' });
      mockReq = { params: { id: '1' } };

      await deleteEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Cannot delete equipment that is assigned to a project',
      });
    });

    it('should handle database errors', async () => {
      (prisma.equipment.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      mockReq = { params: { id: '1' } };

      await deleteEquipment(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error deleting equipment',
        error: expect.any(Error),
      });
    });
  });
}); 