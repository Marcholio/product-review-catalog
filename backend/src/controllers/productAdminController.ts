import { Request, Response } from 'express';
import Product from '../models/Product.js';
import asyncHandler from '../utils/helpers/asyncHandler.js';
import { AuthRequest } from '../middleware/auth/authMiddleware.js';
import { sendSuccess } from '../utils/helpers/responseHandler.js';
import { NotFoundError, ValidationError } from '../utils/errors/AppError.js';

/**
 * Create a new product (admin only)
 */
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, price, imageUrl, category } = req.body;
  
  // Validate required fields
  if (!name) throw new ValidationError('Product name is required');
  if (!description) throw new ValidationError('Product description is required');
  if (!price) throw new ValidationError('Product price is required');
  if (!imageUrl) throw new ValidationError('Product image URL is required');
  if (!category) throw new ValidationError('Product category is required');
  
  // Create new product
  const product = await Product.create({
    name,
    description,
    price,
    imageUrl,
    category,
    rating: 0,
  });
  
  sendSuccess(res, product);
});

/**
 * Update an existing product (admin only)
 */
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const productId = parseInt(req.params.id, 10);
  const { name, description, price, imageUrl, category } = req.body;
  
  // Find the product
  const product = await Product.findByPk(productId);
  
  if (!product) {
    throw new NotFoundError(`Product with ID ${productId} not found`);
  }
  
  // Update product fields
  const updatedProduct = await product.update({
    name: name || product.name,
    description: description || product.description,
    price: price !== undefined ? price : product.price,
    imageUrl: imageUrl || product.imageUrl,
    category: category || product.category,
  });
  
  sendSuccess(res, updatedProduct);
});

/**
 * Delete a product (admin only)
 */
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const productId = parseInt(req.params.id, 10);
  
  // Find the product
  const product = await Product.findByPk(productId);
  
  if (!product) {
    throw new NotFoundError(`Product with ID ${productId} not found`);
  }
  
  // Delete the product
  await product.destroy();
  
  sendSuccess(res, { message: `Product with ID ${productId} has been deleted` });
});

// Export controller
const productAdminController = {
  createProduct,
  updateProduct,
  deleteProduct
};

export default productAdminController;