import { Request, Response } from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { updateProductRating } from '../utils/ratingUtils.js';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({
      where: { 
        productId: parseInt(req.params.productId, 10),
        status: 'approved' // Only show approved reviews to customers
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const { rating, comment, userName } = req.body;

    // Validate product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create review with 'pending' status
    const review = await Review.create({
      productId,
      rating,
      comment,
      userName,
      status: 'pending', // All reviews start as pending by default
    });

    // Update product rating using the utility function
    const averageRating = await updateProductRating(productId);

    res.status(201).json({
      ...review.toJSON(),
      productRating: averageRating
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ 
      message: 'Error creating review', 
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    });
  }
}; 