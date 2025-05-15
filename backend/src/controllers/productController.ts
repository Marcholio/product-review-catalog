import { Request, Response } from 'express';
import Product from '../models/Product.js';
import { Op } from 'sequelize';
import Review from '../models/Review.js';
import sequelize from '../config/database.js';

const ITEMS_PER_PAGE = 12;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt';
    const order = typeof req.query.order === 'string' ? req.query.order : 'DESC';
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    // Generate cache key
    const cacheKey = `products_${sortBy}_${order}_${page}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return res.json(cachedData.data);
    }

    let orderClause: any[] = [];
    let queryOptions: any = {
      limit: ITEMS_PER_PAGE,
      offset,
      attributes: ['id', 'name', 'description', 'price', 'imageUrl', 'category', 'rating'],
      order: orderClause
    };
    
    switch (sortBy) {
      case 'price':
        queryOptions.order = [['price', order.toUpperCase()]];
        break;
      case 'rating':
        queryOptions.order = [['rating', order.toUpperCase()]];
        break;
      case 'popularity':
        // For popularity, we'll sort by the number of reviews
        queryOptions = {
          ...queryOptions,
          include: [{
            model: Review,
            attributes: []
          }],
          attributes: {
            include: [
              [sequelize.fn('COUNT', sequelize.col('Reviews.id')), 'reviewCount']
            ],
            exclude: ['createdAt', 'updatedAt']
          },
          group: [
            'Product.id',
            'Product.name',
            'Product.description',
            'Product.price',
            'Product.imageUrl',
            'Product.category',
            'Product.rating'
          ],
          order: [[sequelize.fn('COUNT', sequelize.col('Reviews.id')), order.toUpperCase()]]
        };
        break;
      default:
        queryOptions.order = [['createdAt', 'DESC']];
    }

    const [products, totalCount] = await Promise.all([
      Product.findAll(queryOptions),
      Product.count()
    ]);

    const response = {
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
        totalItems: totalCount,
        itemsPerPage: ITEMS_PER_PAGE
      }
    };

    // Cache the results
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    res.json(response);
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
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'name', 'description', 'price', 'imageUrl', 'category', 'rating']
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
}; 