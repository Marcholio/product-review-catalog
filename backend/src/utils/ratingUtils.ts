import { literal, Op } from 'sequelize';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

// Helper function to update a single product's rating based on its reviews
export const updateProductRating = async (productId: number): Promise<number> => {
  try {
    // Get only approved reviews for the product
    const reviews = await Review.findAll({
      where: { 
        productId,
        status: 'approved'
      }
    });
    
    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = parseFloat((totalRating / reviews.length).toFixed(2));
    }
    
    // Update the product with the new rating
    const product = await Product.findByPk(productId);
    if (product) {
      await product.update({ rating: averageRating });
    }
    
    return averageRating;
  } catch (error) {
    console.error(`Error updating rating for product ${productId}:`, error);
    throw error;
  }
};

// Helper function to update all product ratings
export const updateAllProductRatings = async (): Promise<void> => {
  try {
    // Get all products
    const products = await Product.findAll();
    
    // Update each product's rating
    for (const product of products) {
      await updateProductRating(product.id);
    }
    
    console.log(`Updated ratings for ${products.length} products`);
  } catch (error) {
    console.error('Error updating all product ratings:', error);
    throw error;
  }
};

// Get product query attributes with review stats (count and avg rating)
export const getProductAttributesWithReviewStats = () => {
  return [
    'id',
    'name',
    'description',
    'price',
    'category',
    'imageUrl',
    'createdAt',
    'updatedAt',
    [
      literal(`(
        SELECT COUNT(*)
        FROM "Reviews"
        WHERE "Reviews"."productId" = "Product"."id"
        AND "Reviews"."status" = 'approved'
      )`),
      'reviewCount'
    ],
    [
      literal(`(
        SELECT COALESCE(AVG("Reviews"."rating"), 0)
        FROM "Reviews"
        WHERE "Reviews"."productId" = "Product"."id"
        AND "Reviews"."status" = 'approved'
      )`),
      'rating'
    ]
  ];
};