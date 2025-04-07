import { Request, Response } from 'express';
import { register, login, changePassword } from '../../controllers/auth.controller';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
  };
});

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mockToken')
}));

describe('Authentication Integration Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let bcrypt: any;
  let prisma: any;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockRes = {
      json: jsonMock,
      status: statusMock
    };
    bcrypt = require('bcryptjs');
    prisma = new (require('@prisma/client').PrismaClient)();
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      prisma.user.create.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User'
      });

      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        }
      };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'mockToken',
          user: expect.objectContaining({
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          })
        })
      );
    });

    it('should not register a user with existing email', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });

      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        }
      };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'User already exists'
      });
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User'
      });
      bcrypt.compare.mockResolvedValueOnce(true);

      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'mockToken',
          user: expect.objectContaining({
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          })
        })
      );
    });

    it('should not login with incorrect password', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User'
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      mockReq = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      };

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should not login with non-existent email', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);

      mockReq = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('should change password successfully', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User'
      });
      bcrypt.compare.mockResolvedValueOnce(true);
      bcrypt.hash.mockResolvedValueOnce('newHashedPassword');
      prisma.user.update.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        password: 'newHashedPassword',
        firstName: 'Test',
        lastName: 'User'
      });

      mockReq = {
        body: {
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        },
        user: { id: 1 }
      };

      await changePassword(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Password changed successfully'
      });
    });

    it('should not change password with incorrect current password', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User'
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      mockReq = {
        body: {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        },
        user: { id: 1 }
      };

      await changePassword(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Current password is incorrect'
      });
    });
  });
}); 