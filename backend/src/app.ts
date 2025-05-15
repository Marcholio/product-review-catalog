import express, { Express, json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

/**
 * Create and configure Express application
 */
const createApp = (): Express => {
  const app = express();
  
  // Security middleware
  app.use(helmet());
  
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