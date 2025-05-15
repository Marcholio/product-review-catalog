import { Request } from 'express';

/**
 * Pagination options extracted from the request
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Default pagination values
 */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Extract and validate pagination parameters from the request query
 * @param req - Express request object
 * @param defaultLimit - Optional custom default limit
 * @param maxLimit - Optional custom max limit
 */
export const extractPaginationOptions = (
  req: Request,
  defaultLimit = DEFAULT_LIMIT,
  maxLimit = MAX_LIMIT
): PaginationOptions => {
  // Extract page and limit from query params
  const requestedPage = parseInt(req.query.page as string, 10) || DEFAULT_PAGE;
  let requestedLimit = parseInt(req.query.limit as string, 10) || defaultLimit;
  
  // Ensure page is at least 1
  const page = Math.max(1, requestedPage);
  
  // Ensure limit is within bounds
  requestedLimit = Math.max(1, requestedLimit); // Minimum 1
  const limit = Math.min(requestedLimit, maxLimit); // Maximum maxLimit
  
  // Calculate offset based on page and limit
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

/**
 * Calculate total pages based on total items and limit
 * @param totalItems - Total number of items
 * @param limit - Items per page
 */
export const calculateTotalPages = (totalItems: number, limit: number): number => {
  return Math.ceil(totalItems / limit);
};

/**
 * Create a pagination metadata object
 * @param page - Current page
 * @param limit - Items per page
 * @param totalItems - Total number of items
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  totalItems: number
) => {
  const totalPages = calculateTotalPages(totalItems, limit);
  
  return {
    page,
    limit,
    totalItems,
    totalPages
  };
};

export default {
  extractPaginationOptions,
  calculateTotalPages,
  createPaginationMeta
};