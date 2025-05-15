import { Request, Response } from 'express';
import Product from '../models/Product.js';
import { Op } from 'sequelize';
import Review from '../models/Review.js';
import sequelize from '../config/database.js';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt';
    const order = typeof req.query.order === 'string' ? req.query.order : 'DESC';
    
    let orderClause: any[] = [];
    
    switch (sortBy) {
      case 'price':
        orderClause = [['price', order.toUpperCase()]];
        break;
      case 'rating':
        orderClause = [['rating', order.toUpperCase()]];
        break;
      case 'popularity':
        // For popularity, we'll sort by the number of reviews
        const products = await Product.findAll({
          include: [{
            model: Review,
            attributes: []
          }],
          attributes: {
            include: [
              [sequelize.fn('COUNT', sequelize.col('Reviews.id')), 'reviewCount']
            ]
          },
          group: [
            'Product.id',
            'Product.name',
            'Product.description',
            'Product.price',
            'Product.imageUrl',
            'Product.category',
            'Product.rating',
            'Product.createdAt',
            'Product.updatedAt'
          ],
          order: [[sequelize.fn('COUNT', sequelize.col('Reviews.id')), order.toUpperCase()]]
        });
        return res.json(products);
      default:
        orderClause = [['createdAt', 'DESC']];
    }

    const products = await Product.findAll({
      order: orderClause
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
}; 