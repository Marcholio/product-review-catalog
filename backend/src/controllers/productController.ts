import { Request, Response } from 'express';
import Product from '../models/Product.js';
import { Op, Order, literal } from 'sequelize';
import Review from '../models/Review.js';
import sequelize from '../config/database.js';

const ITEMS_PER_PAGE = 12;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      category,
      minBudget,
      maxBudget,
      search
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let order: Order = [['createdAt', 'DESC']];
    
    if (sort === 'price') {
      order = [['price', 'ASC']];
    } else if (sort === 'rating') {
      order = [['rating', 'DESC']];
    } else if (sort === 'popularity') {
      order = [[literal('reviewCount'), 'DESC']];
    }

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (minBudget || maxBudget) {
      where.price = {
        ...(minBudget && { [Op.gte]: Number(minBudget) }),
        ...(maxBudget !== undefined && { [Op.lte]: Number(maxBudget) })
      };
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order,
      limit: Number(limit),
      offset,
      attributes: [
        'id',
        'name',
        'description',
        'price',
        'category',
        'rating',
        'imageUrl',
        'createdAt',
        'updatedAt',
        [
          literal(`(
            SELECT COUNT(*)
            FROM "Reviews"
            WHERE "Reviews"."productId" = "Product"."id"
          )`),
          'reviewCount'
        ]
      ],
      include: [{
        model: Review,
        attributes: []
      }],
      group: [
        'Product.id',
        'Product.name',
        'Product.description',
        'Product.price',
        'Product.category',
        'Product.rating',
        'Product.imageUrl',
        'Product.createdAt',
        'Product.updatedAt'
      ]
    });

    // Ensure numeric values are properly typed
    const formattedProducts = products.map(product => {
      const productData = product.toJSON();
      return {
        ...productData,
        price: Number(productData.price),
        rating: Number(productData.rating),
        reviewCount: Number((product as any).getDataValue('reviewCount'))
      };
    });

    res.json({
      products: formattedProducts,
      totalPages: Math.ceil(count.length / Number(limit)),
      currentPage: Number(page),
      totalProducts: count.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
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

export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('category')), 'category']
      ],
      where: {
        category: {
          [Op.ne]: ''
        }
      },
      order: [['category', 'ASC']]
    });

    res.json(categories.map(cat => cat.getDataValue('category')));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
}; 