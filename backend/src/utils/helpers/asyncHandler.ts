import { Request, Response, NextFunction } from 'express';

/**
 * Type for Express route handler functions that return Promises
 */
type AsyncRoute = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wraps an async route handler to automatically catch and forward errors to the error middleware
 * This eliminates the need for try/catch blocks in every controller method
 * 
 * @param fn - Async route handler function
 * @returns Wrapped route handler that forwards errors to next()
 */
const asyncHandler = (fn: AsyncRoute) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler;