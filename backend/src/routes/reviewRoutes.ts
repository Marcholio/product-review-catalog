import express from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/product/:productId', createReview);

export default router; 