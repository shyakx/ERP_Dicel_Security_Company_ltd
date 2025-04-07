import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const SLOW_API_THRESHOLD_MS = 1000; // 1 second

export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  // Add response listener
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    // Log slow API calls
    if (duration > SLOW_API_THRESHOLD_MS) {
      logger.warn('Slow API call detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${SLOW_API_THRESHOLD_MS}ms`
      });
    }
  });

  next();
};

// Memory usage monitor
export const memoryMonitor = (_req: Request, _res: Response, next: NextFunction) => {
  const memoryUsage = process.memoryUsage();
  const memoryThresholdMB = 1024; // 1GB

  if (memoryUsage.heapUsed / 1024 / 1024 > memoryThresholdMB) {
    logger.warn('High memory usage detected', {
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`,
      threshold: `${memoryThresholdMB}MB`
    });
  }

  next();
}; 