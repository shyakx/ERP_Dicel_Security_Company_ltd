import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Get allowed origins from environment variables
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
  }
  return ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5001', 'http://127.0.0.1:5001'];
};

// CORS options configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Create CORS middleware
export const corsMiddleware = cors(corsOptions);

// Role-based CORS middleware
export const roleBasedCors = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Apply basic CORS first
    corsMiddleware(req, res, (err) => {
      if (err) {
        logger.error('CORS error:', err);
        return res.status(403).json({ message: 'CORS error' });
      }
      
      // If user is not authenticated, continue with basic CORS
      if (!req.user) {
        return next();
      }
      
      // Check if user's role is allowed
      if (!roles.includes(req.user.role)) {
        logger.warn(`Role-based CORS blocked request from user with role: ${req.user.role}`);
        return res.status(403).json({ message: 'Role not allowed for this resource' });
      }
      
      // User's role is allowed, continue
      next();
    });
  };
}; 