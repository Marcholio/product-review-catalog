import { Request, Response } from 'express';
import asyncHandler from '../utils/helpers/asyncHandler.js';
import { sendSuccess } from '../utils/helpers/responseHandler.js';
import productService from '../services/productService.js';

/**
 * Get all products with filtering, sorting, and pagination
 */
export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    sort = 'createdAt', 
    category,
    minBudget,
    maxBudget,
    search
  } = req.query;

  // Parse pagination parameters
  const pageNumber = parseInt(page as string, 10);
  const limitNumber = parseInt(limit as string, 10);
  
  // Parse filter parameters
  const filters = {
    category: category as string,
    minBudget: minBudget ? parseFloat(minBudget as string) : undefined,
    maxBudget: maxBudget ? parseFloat(maxBudget as string) : undefined,
    search: search as string
  };
  
  // Get products using service
  const result = await productService.getAllProducts(
    pageNumber,
    limitNumber,
    sort as any,
    filters
  );
  
  // Send response
  sendSuccess(res, result);
});

/**
 * Get a single product by ID
 */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.id, 10);
  const product = await productService.getProductById(productId);
  sendSuccess(res, product);
});

/**
 * Get all product categories
 */
export const getProductCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await productService.getProductCategories();
  sendSuccess(res, categories);
});

/**
 * Recalculate all product ratings
 */
export const recalculateAllRatings = asyncHandler(async (req: Request, res: Response) => {
  const { updateAllProductRatings } = await import('../utils/ratingUtils.js');
  await updateAllProductRatings();
  sendSuccess(res, { message: 'All product ratings have been recalculated' });
});

export default {
  getAllProducts,
  getProductById,
  getProductCategories,
  recalculateAllRatings
};