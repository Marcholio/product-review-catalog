import { Sequelize, QueryTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Get database connection details from environment variables
const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = 'admin',
  DB_PASSWORD = 'adminpass',
  DB_NAME = 'product_catalog'
} = process.env;

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  logging: false
});

/**
 * Script to make a user an admin by updating their isAdmin flag in the database
 */
async function makeUserAdmin() {
  try {
    // Get email from command line arguments
    const email = process.argv[2];
    
    if (!email) {
      console.error('Error: Email is required');
      console.log('Usage: npm run make-admin user@example.com');
      process.exit(1);
    }
    
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to the database');
    
    // First, check if the isAdmin column exists
    try {
      await sequelize.query('SELECT "isAdmin" FROM "Users" LIMIT 1', { type: QueryTypes.SELECT });
      console.log('The isAdmin column exists');
    } catch (error) {
      console.error('The isAdmin column does not exist in the Users table.');
      console.log('Please run: npm run add-admin-column');
      process.exit(1);
    }

    // Check if the user exists
    const users = await sequelize.query(
      'SELECT id, email, name, "isAdmin" FROM "Users" WHERE email = :email',
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );
    
    if (users.length === 0) {
      console.error(`Error: User with email ${email} not found`);
      process.exit(1);
    }
    
    const user = users[0] as any;
    
    // Check if user is already an admin
    if (user.isAdmin) {
      console.log(`User ${user.name} (${user.email}) is already an admin`);
      process.exit(0);
    }
    
    // Update user to be an admin
    await sequelize.query(
      'UPDATE "Users" SET "isAdmin" = true WHERE id = :id',
      {
        replacements: { id: user.id },
        type: QueryTypes.UPDATE
      }
    );
    
    console.log(`Success! User ${user.name} (${user.email}) is now an admin`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

makeUserAdmin();