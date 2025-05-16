import sequelize from '../config/database.js';
import { up as addIndices } from './migrations/addIndices.js';

/**
 * Run the database migrations
 */
async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Run the addIndices migration
    await addIndices(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();