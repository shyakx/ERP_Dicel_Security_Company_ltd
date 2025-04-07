import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employee.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import equipmentRoutes from './routes/equipment.routes';
import incidentRoutes from './routes/incident.routes';
import payrollRoutes from './routes/payroll.routes';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { requestLogger, errorLogger } from './middleware/logging.middleware';
import { performanceMonitor, memoryMonitor } from './middleware/performance.middleware';
import { logger } from './utils/logger';
import { corsMiddleware } from './middleware/cors.middleware';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const prisma = new PrismaClient();

console.log('Starting server initialization...');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging and monitoring middleware
app.use(requestLogger);
app.use(performanceMonitor);
app.use(memoryMonitor);

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check route (before any other routes or complex middleware)
app.get('/health', (_req: Request, res: Response) => {
  console.log('Health check endpoint called');
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/employees`, employeeRoutes);
app.use(`${apiPrefix}/clients`, clientRoutes);
app.use(`${apiPrefix}/projects`, projectRoutes);
app.use(`${apiPrefix}/attendance`, attendanceRoutes);
app.use(`${apiPrefix}/leave`, leaveRoutes);
app.use(`${apiPrefix}/equipment`, equipmentRoutes);
app.use(`${apiPrefix}/incidents`, incidentRoutes);
app.use(`${apiPrefix}/payroll`, payrollRoutes);

// Health check route with prefix
app.get(`${apiPrefix}/health`, (_req: Request, res: Response) => {
  console.log('Prefixed health check endpoint called');
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Prefixed health check available at http://localhost:${PORT}${apiPrefix}/health`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

export { app, prisma }; 