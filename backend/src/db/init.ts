import sequelize, { initializeDatabase } from '../config/database.js';
import config from '../config/environment.js';

// Import models to ensure they're initialized
import '../models/Product.js';
import '../models/Review.js';
import '../models/User.js';
import '../models/Wishlist.js';

/**
 * Initialize the database connection, models, and associations
 * @param forceSync - Whether to force sync (drop and recreate tables)
 */
export const initializeDB = async (forceSync = false): Promise<void> => {
  try {
    // Override with config if not explicitly provided
    const shouldForceSync = forceSync || config.database.forceSync;
    
    // Sync the database
    await initializeDatabase(shouldForceSync);
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

export default { initializeDB, closeDatabase };