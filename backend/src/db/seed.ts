import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { updateAllProductRatings } from '../utils/ratingUtils.js';
import { 
  seedProducts, 
  sampleUserNames,
  generatePositiveComment, 
  generateNeutralComment, 
  generateNegativeComment 
} from './seedData.js';

/**
 * Seed the database with sample products and reviews
 */
const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if products already exist
    const productCount = await Product.count();
    if (productCount > 0) {
      console.log('Database already has products. Skipping seed.');
      return;
    }

    // Add seed products to database
    await Product.bulkCreate(seedProducts);
    console.log(`✅ ${seedProducts.length} sample products added to database`);
    
    // Add some random reviews to products
    const reviewsToCreate = [];
    
    // For each product, create 0-5 random reviews
    for (const product of seedProducts) {
      const reviewCount = Math.floor(Math.random() * 6); // 0 to 5 reviews per product
      for (let i = 0; i < reviewCount; i++) {
        const productId = (await Product.findOne({ where: { name: product.name } }))?.id;
        if (productId) {
          const rating = Math.floor(Math.random() * 5) + 1; // 1 to 5 stars
          const userName = sampleUserNames[Math.floor(Math.random() * sampleUserNames.length)];
          
          // Generate comment based on rating
          let comment;
          if (rating >= 4) {
            comment = generatePositiveComment(product.category);
          } else if (rating === 3) {
            comment = generateNeutralComment(product.category);
          } else {
            comment = generateNegativeComment(product.category);
          }
          
          // Create review with random date in the last 90 days
          reviewsToCreate.push({
            productId,
            userName,
            rating,
            comment,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
          });
        }
      }
    }
    
    // Bulk create reviews if any exist
    if (reviewsToCreate.length > 0) {
      await Review.bulkCreate(reviewsToCreate);
      console.log(`✅ ${reviewsToCreate.length} sample reviews added to database`);
      
      // Update all product ratings based on reviews
      await updateAllProductRatings();
      console.log('✅ Product ratings updated based on reviews');
    }
    
    console.log('🎉 Database seeding completed successfully');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;