import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import sequelize from './config/database.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import userRoutes from './routes/userRoutes.js';
import Product from './models/Product.js';
import Review from './models/Review.js';
import Wishlist from './models/Wishlist.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
interface ErrorWithStack extends Error {
  stack?: string;
  statusCode?: number;
}

app.use((err: ErrorWithStack, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  console.error(err.stack);
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Seed database with sample products
const generateRandomProduct = (index: number) => {
  const categories = ['Electronics', 'Audio', 'Wearables', 'Computers', 'Gaming', 'Home', 'Kitchen', 'Sports', 'Fashion', 'Books'];
  const adjectives = ['Smart', 'Pro', 'Ultra', 'Premium', 'Elite', 'Basic', 'Advanced', 'Deluxe', 'Essential', 'Professional'];
  const nouns = ['Device', 'Gadget', 'Tool', 'System', 'Kit', 'Set', 'Package', 'Bundle', 'Collection', 'Suite'];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return {
    name: `${adjective} ${noun} ${index + 1}`,
    description: `High-quality ${category.toLowerCase()} product with advanced features and modern design. Perfect for everyday use.`,
    price: Number((Math.random() * 2000 + 50).toFixed(2)),
    imageUrl: `https://picsum.photos/seed/${index}/400/300`,
    category: category
  };
};

const seedDatabase = async () => {
  try {
    const seedCount = parseInt(process.env.SEED_COUNT || '100', 10);
    const products = Array.from({ length: seedCount }, (_, index) => generateRandomProduct(index));
    await Product.bulkCreate(products);
    console.log(`${seedCount} sample products added to database`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Database connection and server start
const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database (in development)
    if (process.env.NODE_ENV !== 'production') {
      const shouldForceSync = process.env.FORCE_SYNC === 'true';
      await sequelize.sync({ force: shouldForceSync });
      console.log('Database synced');
      
      // Only seed if explicitly enabled or no products exist
      const shouldSeed = process.env.SEED_DATABASE === 'true';
      const productCount = await Product.count();
      if (shouldSeed || productCount === 0) {
        await seedDatabase();
      }
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer(); 