import type { RateLimitRequestHandler } from 'express-rate-limit';
import * as rateLimit from 'express-rate-limit';

export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
  }
};

export const createRateLimiter = (): RateLimitRequestHandler => {
  const rl = (rateLimit as any).default ? (rateLimit as any).default : (rateLimit as any);
  return rl(securityConfig.rateLimit);
}; 