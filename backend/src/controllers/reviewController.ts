import { Request, Response } from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: parseInt(req.params.productId, 10) },
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

    // Create review
    const review = await Review.create({
      productId,
      rating,
      comment,
      userName,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
}; 