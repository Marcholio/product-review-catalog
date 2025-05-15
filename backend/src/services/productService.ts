import { Op, Order, literal } from 'sequelize';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { NotFoundError } from '../utils/errors/AppError.js';
import { getProductAttributesWithReviewStats } from '../utils/ratingUtils.js';

/**
 * Product filter options
 */
export interface ProductFilterOptions {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  search?: string;
}

/**
 * Product sort options
 */
export type ProductSortOption = 'createdAt' | 'price' | 'rating' | 'popularity';

/**
 * Service layer for product-related operations
 */
class ProductService {
  /**
   * Get all products with filtering, sorting, and pagination
   * @param page - Page number
   * @param limit - Number of items per page
   * @param sort - Sort by field
   * @param filters - Filter options
   */
  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    sort: ProductSortOption = 'createdAt',
    filters: ProductFilterOptions = {}
  ) {
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.minBudget || filters.maxBudget) {
      where.price = {
        ...(filters.minBudget && { [Op.gte]: filters.minBudget }),
        ...(filters.maxBudget && { [Op.lte]: filters.maxBudget })
      };
    }
    
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }
    
    // Base attributes with review count and average rating
    const attributes = getProductAttributesWithReviewStats();
    
    // Base group by clause for aggregate functions
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
    
    // Determine sorting order
    let order: Order;
    switch (sort) {
      case 'price':
        order = [['price', 'ASC']];
        break;
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      case 'popularity':
        // Special case - handle in query
        break;
      case 'createdAt':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }
    
    let products;
    let count;
    
    // Special handling for popularity sort
    if (sort === 'popularity') {
      const result = await Product.findAndCountAll({
        where,
        attributes: attributes,
        include: [{
          model: Review,
          attributes: [],
          required: false
        }],
        group: groupBy,
        limit: limit,
        offset,
        order: [[literal('COUNT(DISTINCT "Reviews"."id")'), 'DESC']],
        subQuery: false
      });
      
      products = result.rows;
      count = result.count;
    } else {
      // Standard query for other sort options
      const result = await Product.findAndCountAll({
        where,
        order,
        limit: limit,
        offset,
        attributes: attributes,
        include: [{
          model: Review,
          attributes: [],
          required: false
        }],
        group: groupBy
      });
      
      products = result.rows;
      count = result.count;
    }
    
    // Format products for consistent output
    const formattedProducts = products.map(product => {
      const productData = product.toJSON();
      return {
        ...productData,
        price: Number(productData.price),
        rating: Number(productData.rating || 0),
        reviewCount: productData.reviewCount !== undefined 
          ? Number(productData.reviewCount) 
          : Number((product as any).getDataValue('reviewCount') || 0)
      };
    });
    
    // Calculate total count
    const totalCount = Array.isArray(count) ? count.length : (typeof count === 'number' ? count : 0);
    
    return {
      products: formattedProducts,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      totalProducts: totalCount
    };
  }
  
  /**
   * Get a single product by ID
   * @param id - Product ID
   */
  async getProductById(id: number) {
    const product = await Product.findByPk(id, {
      attributes: getProductAttributesWithReviewStats(),
      include: [{
        model: Review,
        attributes: [],
        required: false
      }]
    });
    
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    
    // Format the product data
    const productData = product.toJSON();
    
    return {
      ...productData,
      price: Number(productData.price),
      rating: Number(productData.rating || 0),
      reviewCount: Number(productData.reviewCount || 0)
    };
  }
  
  /**
   * Get all available product categories
   */
  async getProductCategories() {
    const categories = await Product.findAll({
      attributes: [
        [literal('DISTINCT("category")'), 'category']
      ],
      where: {
        category: {
          [Op.ne]: ''
        }
      },
      order: [['category', 'ASC']]
    });
    
    return categories.map(cat => cat.getDataValue('category'));
  }
}

export default new ProductService();