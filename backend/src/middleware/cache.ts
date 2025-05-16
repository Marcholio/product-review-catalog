import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Create cache instance with default TTL of 10 minutes and check period of 2 minutes
export const cache = new NodeCache({ 
  stdTTL: 600, 
  checkperiod: 120,
  useClones: false
});

/**
 * Cache middleware factory - returns middleware that caches responses for specified duration
 * @param duration - Cache TTL in seconds
 * @param keyGenerator - Optional function to generate cache key, defaults to request URL
 */
export function cacheMiddleware(duration: number = 600, keyGenerator?: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on URL or custom generator
    const key = keyGenerator ? keyGenerator(req) : req.originalUrl;
    
    // Check if response is in cache
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      console.log(`Cache hit for ${key}`);
      // Send cached response
      return res.status(200).send(cachedResponse);
    }

    // If not in cache, capture the response
    const originalSend = res.send;
    
    // @ts-ignore - Override send method to store response in cache
    res.send = function(body: any): Response {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`Caching response for ${key}`);
        cache.set(key, body, duration);
      }
      
      // Call original send method
      return originalSend.call(this, body);
    };

    // Add HTTP cache headers
    res.set('Cache-Control', `public, max-age=${duration}`);
    
    next();
  };
}

/**
 * Clears the entire cache or a specific key
 * @param key - Optional specific cache key to clear
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.del(key);
  } else {
    cache.flushAll();
  }
}

/**
 * Generates a cache key for request with query parameters
 * Useful for API endpoints with filtering/sorting/pagination
 */
export function generateQueryCacheKey(req: Request): string {
  const baseUrl = req.path;
  const queryParams = req.query;
  
  // Sort query parameters for consistent cache keys
  const sortedParams = Object.keys(queryParams).sort().reduce(
    (acc, key) => {
      acc[key] = queryParams[key];
      return acc;
    }, {} as Record<string, any>
  );
  
  return `${baseUrl}?${JSON.stringify(sortedParams)}`;
}