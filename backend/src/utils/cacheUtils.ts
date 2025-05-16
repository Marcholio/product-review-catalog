import { cache } from '../middleware/cache.js';

/**
 * Cache key prefixes for different resources
 */
export const CACHE_KEYS = {
  PRODUCTS_LIST: 'products_list',
  PRODUCT_DETAILS: 'product_details_',
  CATEGORIES: 'product_categories',
  REVIEWS: 'reviews_',
};

/**
 * Invalidate all product list caches
 */
export function invalidateProductListCache(): void {
  // Get all keys
  const keys = cache.keys();
  
  // Filter keys that start with products_list and delete them
  keys.forEach(key => {
    if (key.startsWith(CACHE_KEYS.PRODUCTS_LIST)) {
      cache.del(key);
    }
  });
  
  // Also invalidate categories cache 
  cache.del(CACHE_KEYS.CATEGORIES);
  
  console.log('Invalidated product list cache');
}

/**
 * Invalidate a specific product cache
 * @param productId - The ID of the product to invalidate
 */
export function invalidateProductCache(productId: number | string): void {
  const productKey = `${CACHE_KEYS.PRODUCT_DETAILS}${productId}`;
  cache.del(productKey);
  
  // Also invalidate any product lists since they might include this product
  invalidateProductListCache();
  
  console.log(`Invalidated cache for product ${productId}`);
}

/**
 * Invalidate a specific product reviews cache
 * @param productId - The ID of the product whose reviews to invalidate
 */
export function invalidateReviewsCache(productId: number | string): void {
  const reviewsKey = `${CACHE_KEYS.REVIEWS}${productId}`;
  cache.del(reviewsKey);
  
  // Also invalidate the product itself since ratings might have changed
  invalidateProductCache(productId);
  
  console.log(`Invalidated reviews cache for product ${productId}`);
}