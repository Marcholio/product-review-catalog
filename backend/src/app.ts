import express, { Express, json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import config from './config/environment.js';
import { swaggerSpec } from './config/swagger.js';
import { securityConfig, createRateLimiter } from './config/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

/**
 * Create and configure Express application
 */
const createApp = (): Express => {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  
  // Compression middleware - reduces payload size for all responses
  app.use(compression({
    // Filter function to determine which responses to compress
    filter: (req, res) => {
      // Don't compress responses explicitly set to no compression
      if (req.headers['x-no-compression']) {
        return false;
      }
      
      // By default, compress all responses
      return compression.filter(req, res);
    },
    // Compression level (0-9, where 9 is maximum compression but slower)
    level: 6
  }));
  
  // Rate limiting - apply different limits to different routes
  // Order matters: specific routes first, then catch-all
  app.use('/api/products', createRateLimiter('productSearch')); // More lenient for product search
  app.use('/api/auth', createRateLimiter('auth')); // Stricter for auth
  
  // Development mode can disable rate limits completely
  if (config.rateLimits.enableRateLimits) {
    app.use('/api/', createRateLimiter('default')); // Default for other routes
  }
  
  // CORS configuration
  app.use(cors(securityConfig.cors));
  
  // Body parsers
  app.use(json());
  app.use(urlencoded({ extended: true }));
  
  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Product Review Catalog API Documentation'
  }));
  
  // Routes
  app.use('/api/products', productRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  
  // Basic route for testing
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Server is running', 
      environment: config.env,
      timestamp: new Date().toISOString()
    });
  });
  
  // Error handling middleware (should be after all routes)
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
};

export default createApp;