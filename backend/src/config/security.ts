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
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 300, // Limit each IP to 300 requests per minute (5 per second)
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      skipSuccessfulRequests: process.env.NODE_ENV === 'development', // In development, don't count successful requests
    },
    // More lenient rate limit for product search
    productSearch: {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 180, // 180 requests per minute (3 per second)
      message: 'Too many search requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: process.env.NODE_ENV === 'development',
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

export const createRateLimiter = (type: 'default' | 'productSearch' | 'auth' = 'default'): RateLimitRequestHandler => {
  const rl = (rateLimit as any).default ? (rateLimit as any).default : (rateLimit as any);
  return rl(securityConfig.rateLimit[type]);
}; 