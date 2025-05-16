import { Request, Response } from 'express';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import asyncHandler from '../utils/helpers/asyncHandler.js';
import { AuthRequest } from '../middleware/auth/authMiddleware.js';

/**
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    // Use raw query for better performance
    const users = await sequelize.query(
      'SELECT id, email, name, "isAdmin", "createdAt", "updatedAt" FROM "Users" ORDER BY "createdAt" DESC',
      {
        type: QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Toggle admin status for a user (admin only)
 */
export const toggleAdminStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Fetch the user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Toggle isAdmin status
    const updatedIsAdmin = !user.isAdmin;
    
    // Update user
    await User.update(
      { isAdmin: updatedIsAdmin },
      { where: { id: userId } }
    );
    
    res.json({
      success: true,
      data: {
        id: userId,
        isAdmin: updatedIsAdmin
      }
    });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Delete a user (admin only)
 */
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Delete the user
    const result = await User.destroy({
      where: { id: userId }
    });
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Get all reviews with product info (admin only)
 */
export const getAllReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    // Join with Product to get product name
    const reviews = await Review.findAll({
      include: [
        {
          model: Product,
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Format the reviews to include product name
    const formattedReviews = reviews.map(review => {
      const reviewData = review.toJSON() as any;
      
      // Handle case where status might be undefined for legacy data
      let status = reviewData.status;
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        status = 'approved'; // Default to approved for backward compatibility
      }
      
      return {
        id: reviewData.id,
        productId: reviewData.productId,
        productName: reviewData.Product?.name || 'Unknown Product',
        userName: reviewData.userName,
        rating: reviewData.rating,
        comment: reviewData.comment,
        status: status,
        createdAt: reviewData.createdAt,
        updatedAt: reviewData.updatedAt
      };
    });

    res.json({
      success: true,
      data: formattedReviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching reviews', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Update review status (approve/reject)
 */
export const updateReviewStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    
    console.log('updateReviewStatus called with:', { reviewId, status });
    console.log('Request body:', req.body);
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      console.log('Invalid status rejected:', status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }
    
    console.log('Finding review with id:', reviewId);
    
    try {
      // Use raw SQL query to update the review status
      const [updateResult] = await sequelize.query(
        `UPDATE "Reviews" SET "status" = :status WHERE "id" = :reviewId RETURNING *`,
        {
          replacements: { 
            status: status,
            reviewId: parseInt(reviewId, 10)
          },
          type: QueryTypes.UPDATE
        }
      );
      
      console.log('Update result:', updateResult);
      
      // Check if any rows were affected
      if (Array.isArray(updateResult) && updateResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found or not updated'
        });
      }
      
      console.log('Review updated via SQL successfully');
      
      // Get the updated review for response
      const [reviewResults] = await sequelize.query(
        `SELECT * FROM "Reviews" WHERE "id" = :reviewId`,
        {
          replacements: { reviewId: parseInt(reviewId, 10) },
          type: QueryTypes.SELECT
        }
      );
      
      if (!reviewResults) {
        return res.status(404).json({
          success: false,
          message: 'Review not found after update'
        });
      }
      
      const review = reviewResults as any;
      console.log('Updated review:', review);
    } catch (sqlError) {
      console.error('SQL Error updating review:', sqlError);
      throw sqlError;
    }
    
    // Get the productId from the review for updating rating
    try {
      // Get productId with direct query to ensure we have it
      const [productIdResult] = await sequelize.query(
        `SELECT "productId" FROM "Reviews" WHERE "id" = :reviewId`,
        {
          replacements: { reviewId: parseInt(reviewId, 10) },
          type: QueryTypes.SELECT
        }
      );
      
      if (productIdResult && (productIdResult as any).productId) {
        const productId = (productIdResult as any).productId;
        console.log('Got productId for rating update:', productId);
        
        // Update product rating
        console.log('Updating product rating after status change...');
        try {
          // Import and use the updateProductRating function
          const { updateProductRating } = await import('../utils/ratingUtils.js');
          const newRating = await updateProductRating(productId);
          console.log('Product rating updated to:', newRating);
        } catch (ratingError) {
          console.error('Error updating product rating:', ratingError);
          // Don't throw, allow the response to continue
        }
      } else {
        console.error('Could not find productId for review:', reviewId);
      }
    } catch (productIdError) {
      console.error('Error getting productId:', productIdError);
      // Continue with response even if rating update fails
    }
    
    // Send success response
    res.json({
      success: true,
      data: {
        id: reviewId,
        status: status
      }
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating review status', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Delete a review (admin only)
 */
export const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    
    console.log('Deleting review with id:', reviewId);
    
    // Get productId first before deleting
    const [productIdResult] = await sequelize.query(
      `SELECT "productId" FROM "Reviews" WHERE "id" = :reviewId`,
      {
        replacements: { reviewId: parseInt(reviewId, 10) },
        type: QueryTypes.SELECT
      }
    );
    
    if (!productIdResult) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    const productId = (productIdResult as any).productId;
    console.log('Found productId for review to delete:', productId);
    
    // Delete the review with SQL query
    const [deleteResult] = await sequelize.query(
      `DELETE FROM "Reviews" WHERE "id" = :reviewId RETURNING id`,
      {
        replacements: { reviewId: parseInt(reviewId, 10) },
        type: QueryTypes.DELETE
      }
    );
    
    console.log('Delete result:', deleteResult);
    
    // Update the product's rating after deleting the review
    try {
      const { updateProductRating } = await import('../utils/ratingUtils.js');
      const newRating = await updateProductRating(productId);
      console.log('Product rating updated to:', newRating, 'after review deletion');
    } catch (ratingError) {
      console.error('Error updating product rating after deletion:', ratingError);
      // Continue with response even if rating update fails
    }
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting review', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});