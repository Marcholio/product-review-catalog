import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/errors/AppError.js';

/**
 * Global error handling middleware for Express
 * Formats errors in a consistent way and handles different types of errors
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`Error [${req.method} ${req.path}]:`, err);

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default error values
  let statusCode = 500;
  let errorName = 'Internal Server Error';
  let errorMessage = 'An unexpected error occurred';
  let errorStack: string | undefined = undefined;
  let errorContext: Record<string, any> | undefined = undefined;
  
  // If it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorName = err.name;
    errorMessage = err.message;
    errorContext = err.context;
    
    if (isDevelopment) {
      errorStack = err.stack;
    }
  }
  // Sequelize validation errors
  else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 422;
    errorName = 'Validation Error';
    errorMessage = err.message;
    
    if (isDevelopment) {
      errorStack = err.stack;
    }
  }
  // JWT verification errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorName = 'Authentication Error';
    errorMessage = 'Invalid or expired token';
    
    if (isDevelopment) {
      errorStack = err.stack;
    }
  }
  // Other errors
  else {
    if (isDevelopment) {
      errorMessage = err.message;
      errorStack = err.stack;
    }
  }

  // Send response
  res.status(statusCode).json({
    error: errorName,
    message: errorMessage,
    ...(errorContext && { context: errorContext }),
    ...(errorStack && { stack: errorStack })
  });
};

/**
 * Middleware to handle 404 errors for routes that don't exist
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(err);
};

export default { errorHandler, notFoundHandler };