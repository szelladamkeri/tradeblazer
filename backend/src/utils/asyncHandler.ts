import { Request, Response, NextFunction } from 'express';

/**
 * Async error handler for Express routes
 * Wraps async route handlers to catch and forward errors to Express error middleware
 */
export default function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
} 