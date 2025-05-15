import type { RateLimitRequestHandler } from 'express-rate-limit';
import * as rateLimit from 'express-rate-limit';

export const securityConfig = {
  jwt: {
    // Using a secure default secret for development, but should be overridden in production
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: 'HS256' as const,
    audience: process.env.JWT_AUDIENCE || 'product-review-catalog',
    issuer: process.env.JWT_ISSUER || 'product-review-catalog-api'
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
  },
  rateLimit: {
    // Default rate limit for most endpoints
    default: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    // More lenient rate limit for product search
    productSearch: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 60, // 60 requests per minute (1 per second)
      message: 'Too many search requests, please try again later.'
    },
    // Stricter rate limit for authentication
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // 20 attempts per 15 minutes
      message: 'Too many authentication attempts, please try again later.'
    }
  }
};

export const createRateLimiter = (type: 'default' | 'productSearch' | 'auth' = 'default'): RateLimitRequestHandler => {
  const rl = (rateLimit as any).default ? (rateLimit as any).default : (rateLimit as any);
  return rl(securityConfig.rateLimit[type]);
}; 