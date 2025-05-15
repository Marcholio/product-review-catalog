import type { RateLimitRequestHandler } from 'express-rate-limit';
import * as rateLimit from 'express-rate-limit';
import config from './environment.js';

/**
 * Comprehensive security configuration
 */
export const securityConfig = {
  jwt: {
    secret: config.auth.jwtSecret,
    expiresIn: config.auth.jwtExpiresIn,
    algorithm: 'HS256' as const,
    audience: process.env.JWT_AUDIENCE || 'product-review-catalog',
    issuer: process.env.JWT_ISSUER || 'product-review-catalog-api'
  },
  cors: {
    origin: config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
  },
  rateLimit: {
    // Default rate limit for most endpoints
    default: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 300, // Limit each IP to 300 requests per minute (5 per second)
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      skipSuccessfulRequests: !config.isProduction, // Skip successful requests in non-production
    },
    // More lenient rate limit for product search
    productSearch: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 180, // 180 requests per minute (3 per second)
      message: 'Too many search requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: !config.isProduction,
    },
    // Stricter rate limit for authentication
    auth: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 60, // 60 attempts per 5 minutes
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false, // Always count auth attempts, even in development
    }
  }
};

/**
 * Create a rate limiter middleware
 * @param type - The type of rate limiter to create
 * @returns Rate limiter middleware
 */
export const createRateLimiter = (
  type: 'default' | 'productSearch' | 'auth' = 'default'
): RateLimitRequestHandler => {
  // Handle different import formats
  const rl = (rateLimit as any).default ? (rateLimit as any).default : (rateLimit as any);
  
  // Only apply rate limiting if enabled or in production
  if (!config.rateLimits.enableRateLimits && !config.isProduction) {
    // Return a pass-through middleware when rate limiting is disabled
    return (req, res, next) => next();
  }
  
  return rl(securityConfig.rateLimit[type]);
};