import { Request, Response } from 'express';

// Create a mock Prisma client instance
const mockPrismaClient = {
  client: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

// Import the controller after mocking dependencies
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require('../../controllers/client.controller');

describe('Client Controller Tests', () => {
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

  describe('getAllClients', () => {
    const mockClients = [
      {
        id: '1',
        name: 'Test Client 1',
        contactPerson: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Test St',
        contractStartDate: new Date('2024-01-01'),
        contractEndDate: new Date('2024-12-31'),
        status: 'ACTIVE',
        projects: []
      },
      {
        id: '2',
        name: 'Test Client 2',
        contactPerson: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        address: '456 Test Ave',
        contractStartDate: new Date('2024-01-01'),
        contractEndDate: null,
        status: 'ACTIVE',
        projects: []
      }
    ];

    it('should return all clients', async () => {
      mockPrismaClient.client.findMany.mockResolvedValueOnce(mockClients);

      await getAllClients({} as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockClients);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.client.findMany.mockRejectedValueOnce(error);

      await getAllClients({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching clients',
        error
      });
    });
  });

  describe('getClientById', () => {
    const mockClient = {
      id: '1',
      name: 'Test Client',
      contactPerson: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Test St',
      contractStartDate: new Date('2024-01-01'),
      contractEndDate: new Date('2024-12-31'),
      status: 'ACTIVE',
      projects: []
    };

    it('should return client by ID', async () => {
      mockPrismaClient.client.findUnique.mockResolvedValueOnce(mockClient);
      mockReq = {
        params: { id: '1' }
      };

      await getClientById(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockClient);
    });

    it('should return 404 if client not found', async () => {
      mockPrismaClient.client.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' }
      };

      await getClientById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Client not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.client.findUnique.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' }
      };

      await getClientById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching client',
        error
      });
    });
  });

  describe('createClient', () => {
    const newClient = {
      name: 'New Client',
      contactPerson: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Test St',
      contractStartDate: '2024-01-01',
      contractEndDate: '2024-12-31',
      status: 'ACTIVE'
    };

    it('should create a new client', async () => {
      const createdClient = {
        id: '1',
        ...newClient,
        contractStartDate: new Date(newClient.contractStartDate),
        contractEndDate: new Date(newClient.contractEndDate),
        projects: []
      };

      mockPrismaClient.client.create.mockResolvedValueOnce(createdClient);
      mockReq = {
        body: newClient
      };

      await createClient(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdClient);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.client.create.mockRejectedValueOnce(error);
      mockReq = {
        body: newClient
      };

      await createClient(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error creating client',
        error
      });
    });
  });

  describe('updateClient', () => {
    const updatedClient = {
      name: 'Updated Client',
      contactPerson: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Test St',
      contractStartDate: '2024-01-01',
      contractEndDate: '2024-12-31',
      status: 'ACTIVE'
    };

    it('should update an existing client', async () => {
      const existingClient = {
        id: '1',
        ...updatedClient,
        contractStartDate: new Date(updatedClient.contractStartDate),
        contractEndDate: new Date(updatedClient.contractEndDate)
      };

      mockPrismaClient.client.findUnique.mockResolvedValueOnce(existingClient);
      mockPrismaClient.client.update.mockResolvedValueOnce(existingClient);
      mockReq = {
        params: { id: '1' },
        body: updatedClient
      };

      await updateClient(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(existingClient);
    });

    it('should return 404 if client not found', async () => {
      mockPrismaClient.client.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' },
        body: updatedClient
      };

      await updateClient(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Client not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.client.findUnique.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' },
        body: updatedClient
      };

      await updateClient(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating client',
        error
      });
    });
  });

  describe('deleteClient', () => {
    it('should delete an existing client', async () => {
      const existingClient = {
        id: '1',
        name: 'Test Client'
      };

      mockPrismaClient.client.findUnique.mockResolvedValueOnce(existingClient);
      mockReq = {
        params: { id: '1' }
      };

      await deleteClient(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Client deleted successfully'
      });
    });

    it('should return 404 if client not found', async () => {
      mockPrismaClient.client.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' }
      };

      await deleteClient(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Client not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.client.findUnique.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' }
      };

      await deleteClient(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error deleting client',
        error
      });
    });
  });
}); 