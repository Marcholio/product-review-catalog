import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     description: Retrieve all products in the user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, getWishlist);

/**
 * @swagger
 * /api/wishlist/product/{productId}:
 *   post:
 *     summary: Add product to wishlist
 *     description: Add a product to the user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to add
 *     responses:
 *       201:
 *         description: Product added to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wishlist'
 *       400:
 *         description: Product already in wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post('/product/:productId', auth, addToWishlist);

/**
 * @swagger
 * /api/wishlist/product/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     description: Remove a product from the user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to remove
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in wishlist
 *       500:
 *         description: Server error
 */
router.delete('/product/:productId', auth, removeFromWishlist);

export default router; 