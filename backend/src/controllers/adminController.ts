import { Request, Response } from 'express';
import User from '../models/User.js';
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