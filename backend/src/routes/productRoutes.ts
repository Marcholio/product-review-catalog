import express from 'express';
import productController from '../controllers/productController.js';
import { optionalAuth } from '../middleware/auth/index.js';
import { cacheMiddleware, generateQueryCacheKey } from '../middleware/cache.js';

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products with optional filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search products by name or description
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       500:
 *         description: Server error
 */
// Cache product list for 5 minutes (300 seconds), but use custom key generator
// for proper caching of different query parameters
router.get('/', optionalAuth, cacheMiddleware(300, generateQueryCacheKey), productController.getAllProducts);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all product categories
 *     description: Retrieve a list of all available product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 */
// Cache categories for 1 hour (3600 seconds) since they rarely change
router.get('/categories', cacheMiddleware(3600), productController.getProductCategories);

/**
 * @swagger
 * /api/products/admin/recalculate-ratings:
 *   post:
 *     summary: Recalculate all product ratings
 *     description: Administrative endpoint to recalculate all product ratings based on their reviews
 *     tags: [Products, Admin]
 *     responses:
 *       200:
 *         description: Ratings recalculated successfully
 *       500:
 *         description: Server error
 */
router.post('/admin/recalculate-ratings', productController.recalculateAllRatings);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve detailed information about a specific product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
// Cache individual product details for 10 minutes (600 seconds)
router.get('/:id', optionalAuth, cacheMiddleware(600), productController.getProductById);

export default router;