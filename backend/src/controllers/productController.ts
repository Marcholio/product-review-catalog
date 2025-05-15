import { Request, Response } from 'express';
import Product from '../models/Product.js';
import { Op, Order, literal } from 'sequelize';
import Review from '../models/Review.js';
import sequelize from '../config/database.js';
import { getProductAttributesWithReviewStats, updateAllProductRatings } from '../utils/ratingUtils.js';

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
    
    // Handle different sort options
    if (sort === 'price') {
      order = [['price', 'ASC']];
    } else if (sort === 'rating') {
      order = [['rating', 'DESC']];
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

    // Base query attributes with review count and average rating
    const attributes = getProductAttributesWithReviewStats();

    // Base group by clause - needed for aggregate functions
    const groupBy = [
      'Product.id',
      'Product.name',
      'Product.description',
      'Product.price',
      'Product.category',
      'Product.rating',
      'Product.imageUrl',
      'Product.createdAt',
      'Product.updatedAt'
    ];

    let products;
    let count;

    // Special handling for popularity sort
    if (sort === 'popularity') {
      // Use a different approach for sorting by popularity
      // The key issue is that the 'reviewCount' is an alias in the outer query
      // So we need to adjust the SQL to properly order by it
      const result = await Product.findAndCountAll({
        where,
        attributes: attributes,
        include: [{
          model: Review,
          attributes: [],
          required: false // Use LEFT JOIN to include products with no reviews
        }],
        group: groupBy,
        limit: Number(limit),
        offset,
        order: [[literal('COUNT(DISTINCT "Reviews"."id")'), 'DESC']], // Use DISTINCT to avoid duplicate counting
        subQuery: false
      });
      
      products = result.rows;
      count = result.count;
    } else {
      // Standard query for other sort options
      const result = await Product.findAndCountAll({
        where,
        order,
        limit: Number(limit),
        offset,
        attributes: attributes,
        include: [{
          model: Review,
          attributes: []
        }],
        group: groupBy
      });
      
      products = result.rows;
      count = result.count;
    }

    // Ensure numeric values are properly typed
    const formattedProducts = products.map(product => {
      const productData = product.toJSON();
      return {
        ...productData,
        price: Number(productData.price),
        rating: Number(productData.rating),
        // Handle reviewCount correctly
        reviewCount: productData.reviewCount !== undefined 
          ? Number(productData.reviewCount) 
          : Number((product as any).getDataValue('reviewCount') || 0)
      };
    });

    // Calculate total pages and total products correctly
    const totalCount = Array.isArray(count) ? count.length : (typeof count === 'number' ? count : 0);

    res.json({
      products: formattedProducts,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      totalProducts: totalCount
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Provide a more detailed error message in development
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { error: error instanceof Error ? error.message : JSON.stringify(error), stack: error instanceof Error ? error.stack : undefined }
      : {};
    
    res.status(500).json({ 
      message: 'Error fetching products',
      ...errorDetails
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    // Find the product with calculated rating from reviews
    const product = await Product.findByPk(req.params.id, {
      attributes: getProductAttributesWithReviewStats(),
      include: [{
        model: Review,
        attributes: [],
        required: false
      }]
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Format the product data
    const productData = product.toJSON();
    
    res.json({
      ...productData,
      price: Number(productData.price),
      rating: Number(productData.rating || 0),
      reviewCount: Number(productData.reviewCount || 0)
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: 'Error fetching product', 
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    });
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

// Admin route to update all product ratings
export const recalculateAllRatings = async (req: Request, res: Response) => {
  try {
    await updateAllProductRatings();
    res.json({ message: 'All product ratings have been recalculated' });
  } catch (error) {
    console.error('Error recalculating product ratings:', error);
    res.status(500).json({ 
      message: 'Error recalculating product ratings', 
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    });
  }
}; 