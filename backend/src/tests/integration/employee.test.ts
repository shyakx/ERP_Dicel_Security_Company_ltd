import { Request, Response } from 'express';

// Create a mock Prisma client instance
const mockPrismaClient = {
  employee: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  user: {
    findUnique: jest.fn()
  }
};

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient)
}));

// Import the controller after mocking dependencies
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../../controllers/employee.controller');

describe('Employee Controller Tests', () => {
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

  describe('getAllEmployees', () => {
    const mockEmployees = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Test St',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'MALE',
        nationalId: 'ID123456',
        employmentDate: new Date('2024-01-01'),
        position: 'SECURITY_GUARD',
        status: 'ACTIVE',
        salary: 50000
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        address: '456 Test Ave',
        dateOfBirth: new Date('1992-01-01'),
        gender: 'FEMALE',
        nationalId: 'ID789012',
        employmentDate: new Date('2024-01-01'),
        position: 'SUPERVISOR',
        status: 'ACTIVE',
        salary: 60000
      }
    ];

    it('should return all employees', async () => {
      mockPrismaClient.employee.findMany.mockResolvedValueOnce(mockEmployees);

      await getAllEmployees({} as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockEmployees);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.employee.findMany.mockRejectedValueOnce(error);

      await getAllEmployees({} as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching employees',
        error
      });
    });
  });

  describe('getEmployeeById', () => {
    const mockEmployee = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Test St',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MALE',
      nationalId: 'ID123456',
      employmentDate: new Date('2024-01-01'),
      position: 'SECURITY_GUARD',
      status: 'ACTIVE',
      salary: 50000
    };

    it('should return employee by ID', async () => {
      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(mockEmployee);
      mockReq = {
        params: { id: '1' }
      };

      await getEmployeeById(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(mockEmployee);
    });

    it('should return 404 if employee not found', async () => {
      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' }
      };

      await getEmployeeById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Employee not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.employee.findUnique.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' }
      };

      await getEmployeeById(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error fetching employee',
        error
      });
    });
  });

  describe('createEmployee', () => {
    const newEmployee = {
      userId: '1',
      employeeId: 'EMP001',
      department: 'SECURITY',
      position: 'SECURITY_GUARD',
      hireDate: '2024-01-01',
      salary: '50000',
      status: 'ACTIVE'
    };

    it('should create a new employee', async () => {
      const mockUser = {
        id: '1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE'
      };

      const createdEmployee = {
        id: '1',
        ...newEmployee,
        hireDate: new Date(newEmployee.hireDate),
        salary: parseFloat(newEmployee.salary),
        user: mockUser
      };

      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(null); // No existing employee
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(mockUser); // User exists
      mockPrismaClient.employee.create.mockResolvedValueOnce(createdEmployee);
      mockReq = {
        body: newEmployee
      };

      await createEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdEmployee);
    });

    it('should return 400 if employee ID already exists', async () => {
      const existingEmployee = {
        id: '1',
        employeeId: 'EMP001'
      };

      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(existingEmployee);
      mockReq = {
        body: newEmployee
      };

      await createEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Employee ID already exists'
      });
    });

    it('should return 404 if user not found', async () => {
      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(null); // No existing employee
      mockPrismaClient.user.findUnique.mockResolvedValueOnce(null); // User not found
      mockReq = {
        body: newEmployee
      };

      await createEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User not found'
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.employee.findUnique.mockRejectedValueOnce(error);
      mockReq = {
        body: newEmployee
      };

      await createEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error creating employee',
        error
      });
    });
  });

  describe('updateEmployee', () => {
    const updatedEmployee = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.updated@example.com',
      phone: '1234567890',
      address: '123 Test St',
      dateOfBirth: '1990-01-01',
      gender: 'MALE',
      nationalId: 'ID123456',
      employmentDate: '2024-01-01',
      position: 'SUPERVISOR',
      status: 'ACTIVE',
      salary: '60000'
    };

    it('should update an existing employee', async () => {
      const existingEmployee = {
        id: '1',
        ...updatedEmployee,
        dateOfBirth: new Date(updatedEmployee.dateOfBirth),
        employmentDate: new Date(updatedEmployee.employmentDate),
        salary: parseFloat(updatedEmployee.salary)
      };

      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(existingEmployee);
      mockPrismaClient.employee.update.mockResolvedValueOnce(existingEmployee);
      mockReq = {
        params: { id: '1' },
        body: updatedEmployee
      };

      await updateEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(existingEmployee);
    });

    it('should return 404 if employee not found', async () => {
      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' },
        body: updatedEmployee
      };

      await updateEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Employee not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.employee.findUnique.mockResolvedValueOnce({
        id: '1',
        ...updatedEmployee
      });
      mockPrismaClient.employee.update.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' },
        body: updatedEmployee
      };

      await updateEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error updating employee',
        error
      });
    });
  });

  describe('deleteEmployee', () => {
    it('should delete an existing employee', async () => {
      const existingEmployee = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe'
      };

      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(existingEmployee);
      mockReq = {
        params: { id: '1' }
      };

      await deleteEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Employee deleted successfully'
      });
    });

    it('should return 404 if employee not found', async () => {
      mockPrismaClient.employee.findUnique.mockResolvedValueOnce(null);
      mockReq = {
        params: { id: '999' }
      };

      await deleteEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Employee not found' });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockPrismaClient.employee.findUnique.mockRejectedValueOnce(error);
      mockReq = {
        params: { id: '1' }
      };

      await deleteEmployee(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error deleting employee',
        error
      });
    });
  });
}); 