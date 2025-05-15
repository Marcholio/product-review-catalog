import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import type { AuthRequest } from '../middleware/auth/index.js';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;
    
    const wishlistItems = await Wishlist.findAll({
      where: { userId },
      include: [Product],
      order: [['createdAt', 'DESC']],
    });
    
    res.json(wishlistItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error });
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;
    const productId = parseInt(req.params.productId, 10);

    // Validate product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is already in user's wishlist
    const existingItem = await Wishlist.findOne({ 
      where: { 
        productId,
        userId 
      } 
    });
    
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add to wishlist with user ID
    const wishlistItem = await Wishlist.create({ productId, userId });
    const wishlistItemWithProduct = await Wishlist.findByPk(wishlistItem.id, {
      include: [Product],
    });

    res.status(201).json(wishlistItemWithProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist', error });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;
    const productId = parseInt(req.params.productId, 10);
    
    const deleted = await Wishlist.destroy({
      where: { 
        productId,
        userId 
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist', error });
  }
}; 