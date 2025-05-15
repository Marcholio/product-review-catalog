import { testConnection } from './config/database.js';
import { initializeDB } from './db/init.js';
import createApp from './app.js';
import config from './config/environment.js';
import seedDatabase from './db/seed.js';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    console.log(`🔄 Starting server in ${config.env} mode...`);
    
    // Test database connection
    await testConnection();
    
    // Initialize database with models
    const shouldForceSync = config.database.forceSync;
    await initializeDB(shouldForceSync);
    
    // Seed database if needed
    if (shouldForceSync || process.env.SEED_DATABASE === 'true') {
      await seedDatabase();
    }
    
    // Create Express app
    const app = createApp();
    
    // Start the server
    const server = app.listen(config.server.port, () => {
      console.log(`🚀 Server running at http://${config.server.host}:${config.server.port}`);
      console.log(`📚 API Documentation: http://${config.server.host}:${config.server.port}/api-docs`);
    });
    
    // Handle shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export default startServer;