import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import Product from './models/Product.js';
import Review from './models/Review.js';
import Wishlist from './models/Wishlist.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Basic route for testing
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
interface ErrorWithStack extends Error {
  stack?: string;
}

app.use((err: ErrorWithStack, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    const products = Array.from({ length: 1000 }, (_, index) => generateRandomProduct(index));
    await Product.bulkCreate(products);
    console.log('1000 sample products added to database');
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
      await sequelize.sync({ alter: true });
      console.log('Database synced');
      
      // Seed database with sample products
      const productCount = await Product.count();
      if (productCount === 0) {
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