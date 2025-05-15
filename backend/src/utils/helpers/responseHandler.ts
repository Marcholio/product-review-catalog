import { Response } from 'express';

/**
 * Standard success response format
 */
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

/**
 * Pagination metadata
 */
interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Send a success response with standardized format
 * @param res - Express response object
 * @param data - Data to send
 * @param message - Optional success message
 * @param meta - Optional metadata
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  meta?: Record<string, any>,
  statusCode = 200
): void => {
  const responseBody: SuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta })
  };

  res.status(statusCode).json(responseBody);
};

/**
 * Send a paginated response with standardized format
 * @param res - Express response object
 * @param data - Data array to send
 * @param pagination - Pagination metadata
 * @param message - Optional success message
 * @param additionalMeta - Optional additional metadata
 */
export const sendPaginatedSuccess = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message?: string,
  additionalMeta?: Record<string, any>
): void => {
  const meta = {
    pagination,
    ...(additionalMeta || {})
  };

  sendSuccess(res, data, message, meta);
};

/**
 * Send a created response (201) with standardized format
 * @param res - Express response object
 * @param data - Data to send
 * @param message - Optional success message
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): void => {
  sendSuccess(res, data, message, undefined, 201);
};

/**
 * Send a no content response (204)
 * @param res - Express response object
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).end();
};

export default {
  sendSuccess,
  sendPaginatedSuccess,
  sendCreated,
  sendNoContent
};