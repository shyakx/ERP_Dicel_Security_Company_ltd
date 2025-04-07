import { Request, Response } from 'express';

// Create a mock Prisma client instance
const mockPrismaClient = {
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  client: {
    findUnique: jest.fn()
  }
};

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

// Import the controller after mocking dependencies
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../../controllers/project.controller');

describe('Project Controller Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockRes = {
      json: jsonMock,
      status: statusMock
    };
    jest.clearAllMocks();
  });

  describe('getAllProjects', () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Test Project 1',
        description: 'Test Description 1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
        clientId: '1',
        client: {
          id: '1',
          name: 'Test Client 1'
        }
      },
      {
        id: '2',
        name: 'Test Project 2',
        description: 'Test Description 2',
        startDate: new Date('2024-01-01'),
        endDate: null,
        status: 'ACTIVE',
        clientId: '2',
        client: {
          id: '2',
          name: 'Test Client 2'
        }
      }
    ];

    it('should return all projects', async () => {
      mockPrismaClient.project.findMany.mockResolvedValueOnce(mockProjects);

      await getAllProjects({} as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockProjects);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.project.findMany.mockRejectedValueOnce(error);

      await getAllProjects({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching projects',
        error
      });
    });
  });

  describe('getProjectById', () => {
    const mockProject = {
      id: '1',
      name: 'Test Project',
      description: 'Test Description',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'ACTIVE',
      clientId: '1',
      client: {
        id: '1',
        name: 'Test Client'
      }
    };

    it('should return project by ID', async () => {
      mockPrismaClient.project.findUnique.mockResolvedValueOnce(mockProject);
      mockReq = {
        params: { id: '1' }
      };

      await getProjectById(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockProject);
    });

    it('should return 404 if project not found', async () => {
      mockPrismaClient.project.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' }
      };

      await getProjectById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.project.findUnique.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' }
      };

      await getProjectById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching project',
        error
      });
    });
  });

  describe('createProject', () => {
    const newProject = {
      name: 'New Project',
      description: 'New Description',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'ACTIVE',
      clientId: '1'
    };

    it('should create a new project', async () => {
      const createdProject = {
        id: '1',
        ...newProject,
        startDate: new Date(newProject.startDate),
        endDate: new Date(newProject.endDate),
        client: {
          id: '1',
          name: 'Test Client'
        }
      };

      mockPrismaClient.client.findUnique.mockResolvedValueOnce({ id: '1', name: 'Test Client' });
      mockPrismaClient.project.create.mockResolvedValueOnce(createdProject);
      mockReq = {
        body: newProject
      };

      await createProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdProject);
    });

    it('should return 404 if client not found', async () => {
      mockPrismaClient.client.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        body: newProject
      };

      await createProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Client not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.client.findUnique.mockResolvedValueOnce({ id: '1', name: 'Test Client' });
      mockPrismaClient.project.create.mockRejectedValueOnce(error);
      mockReq = {
        body: newProject
      };

      await createProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error creating project',
        error
      });
    });
  });

  describe('updateProject', () => {
    const updatedProject = {
      name: 'Updated Project',
      description: 'Updated Description',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'ACTIVE',
      clientId: '1'
    };

    it('should update an existing project', async () => {
      const existingProject = {
        id: '1',
        ...updatedProject,
        startDate: new Date(updatedProject.startDate),
        endDate: new Date(updatedProject.endDate),
        client: {
          id: '1',
          name: 'Test Client'
        }
      };

      mockPrismaClient.project.findUnique.mockResolvedValueOnce(existingProject);
      mockPrismaClient.client.findUnique.mockResolvedValueOnce({ id: '1', name: 'Test Client' });
      mockPrismaClient.project.update.mockResolvedValueOnce(existingProject);
      mockReq = {
        params: { id: '1' },
        body: updatedProject
      };

      await updateProject(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(existingProject);
    });

    it('should return 404 if project not found', async () => {
      mockPrismaClient.project.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' },
        body: updatedProject
      };

      await updateProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should return 404 if client not found', async () => {
      const existingProject = {
        id: '1',
        ...updatedProject,
        startDate: new Date(updatedProject.startDate),
        endDate: new Date(updatedProject.endDate)
      };

      mockPrismaClient.project.findUnique.mockResolvedValueOnce(existingProject);
      mockPrismaClient.client.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '1' },
        body: updatedProject
      };

      await updateProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Client not found' });
      expect(mockPrismaClient.project.update).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      const existingProject = {
        id: '1',
        ...updatedProject,
        startDate: new Date(updatedProject.startDate),
        endDate: new Date(updatedProject.endDate)
      };

      mockPrismaClient.project.findUnique.mockResolvedValueOnce(existingProject);
      mockPrismaClient.client.findUnique.mockResolvedValueOnce({ id: '1', name: 'Test Client' });
      mockPrismaClient.project.update.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' },
        body: updatedProject
      };

      await updateProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating project',
        error
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete an existing project', async () => {
      const existingProject = {
        id: '1',
        name: 'Test Project'
      };

      mockPrismaClient.project.findUnique.mockResolvedValueOnce(existingProject);
      mockReq = {
        params: { id: '1' }
      };

      await deleteProject(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Project deleted successfully'
      });
    });

    it('should return 404 if project not found', async () => {
      mockPrismaClient.project.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' }
      };

      await deleteProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.project.findUnique.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' }
      };

      await deleteProject(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error deleting project',
        error
      });
    });
  });
}); 