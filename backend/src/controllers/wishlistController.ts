import { Request, Response } from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

export const getWishlist = async (_req: Request, res: Response) => {
  try {
    const wishlistItems = await Wishlist.findAll({
      include: [Product],
      order: [['createdAt', 'DESC']],
    });
    res.json(wishlistItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    // Validate product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is already in wishlist
    const existingItem = await Wishlist.findOne({ where: { productId } });
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({ productId });
    const wishlistItemWithProduct = await Wishlist.findByPk(wishlistItem.id, {
      include: [Product],
    });

    res.status(201).json(wishlistItemWithProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to wishlist', error });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    
    const deleted = await Wishlist.destroy({
      where: { productId },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error removing from wishlist', error });
  }
}; 