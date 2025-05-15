/**
 * Custom application error class that extends the native Error class
 * with additional properties for better error handling
 */
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  /**
   * Creates a new AppError instance
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param isOperational - Whether this is an operational error (expected) or a programming error (unexpected)
   * @param context - Additional context data for the error
   */
  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.name = this.constructor.name;
    
    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error factory methods
export const BadRequestError = (message: string, context?: Record<string, any>) => 
  new AppError(message, 400, true, context);

export const UnauthorizedError = (message = 'Unauthorized', context?: Record<string, any>) => 
  new AppError(message, 401, true, context);

export const ForbiddenError = (message = 'Forbidden', context?: Record<string, any>) => 
  new AppError(message, 403, true, context);

export const NotFoundError = (message = 'Not found', context?: Record<string, any>) => 
  new AppError(message, 404, true, context);

export const ConflictError = (message: string, context?: Record<string, any>) => 
  new AppError(message, 409, true, context);

export const ValidationError = (message: string, context?: Record<string, any>) => 
  new AppError(message, 422, true, context);

export const InternalServerError = (message = 'Internal server error', context?: Record<string, any>) => 
  new AppError(message, 500, false, context);

export const ServiceUnavailableError = (message = 'Service unavailable', context?: Record<string, any>) => 
  new AppError(message, 503, true, context);

export default AppError;