import { Sequelize } from 'sequelize';
import config from './environment.js';

/**
 * Sequelize database connection instance
 * Configured using environment variables with sensible defaults
 */
const sequelize = new Sequelize({
  dialect: config.database.dialect,
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  logging: config.database.logging ? console.log : false,
  define: {
    timestamps: true, // Add createdAt and updatedAt timestamps to models
    underscored: false, // Use camelCase for fields (not snake_case)
  },
  pool: {
    max: 5, // Maximum number of connections in pool
    min: 0, // Minimum number of connections in pool
    acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
    idle: 10000, // Maximum time (ms) that a connection can be idle before being released
  },
});

/**
 * Test database connection
 * @returns Promise that resolves when connection is successful
 */
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

/**
 * Initialize database with tables
 * @param force - Whether to drop tables before recreating them
 * @returns Promise that resolves when sync is complete
 */
export const initializeDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log(
      `✅ Database synced${force ? ' with force' : ''}`
    );
  } catch (error) {
    console.error('❌ Unable to sync database:', error);
    throw error;
  }
};

export default sequelize;