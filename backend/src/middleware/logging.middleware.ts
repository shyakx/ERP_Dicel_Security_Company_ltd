import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Log request
  logger.info(`Incoming ${method} request to ${originalUrl}`, {
    method,
    url: originalUrl,
    ip,
    userAgent: req.get('user-agent'),
    body: method !== 'GET' ? req.body : undefined
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    logger.info(`${method} ${originalUrl} completed`, {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip
    });
  });

  next();
};

export const errorLogger = (error: Error, req: Request, _res: Response, next: NextFunction) => {
  logger.error('Error processing request:', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }
  });
  next(error);
}; 