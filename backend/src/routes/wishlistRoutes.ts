import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.get('/', getWishlist);
router.post('/product/:productId', addToWishlist);
router.delete('/product/:productId', removeFromWishlist);

export default router; 