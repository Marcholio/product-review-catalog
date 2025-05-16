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
 * Script to add isAdmin column to Users table and set up admin user
 */
async function addIsAdminColumn() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to the database');
    
    // Check if the column already exists
    try {
      await sequelize.query(
        'SELECT "isAdmin" FROM "Users" LIMIT 1',
        {
          type: QueryTypes.SELECT
        }
      );
      console.log('The isAdmin column already exists');
    } catch (error) {
      console.log('isAdmin column does not exist, adding it now...');
      
      // Add the isAdmin column with a default value of false
      await sequelize.query(
        'ALTER TABLE "Users" ADD COLUMN "isAdmin" BOOLEAN DEFAULT false NOT NULL',
        {
          type: QueryTypes.RAW
        }
      );
      
      console.log('isAdmin column added successfully');
    }
    
    // Check if an admin email was provided as a command line argument
    const adminEmail = process.argv[2];
    if (adminEmail) {
      console.log(`Setting up admin user with email: ${adminEmail}`);
      
      // Check if the user exists
      const users = await sequelize.query(
        'SELECT id, email, name FROM "Users" WHERE email = :email',
        {
          replacements: { email: adminEmail },
          type: QueryTypes.SELECT
        }
      );
      
      if (users.length === 0) {
        console.error(`Error: User with email ${adminEmail} not found`);
      } else {
        const user = users[0] as any;
        
        // Update user to be an admin
        await sequelize.query(
          'UPDATE "Users" SET "isAdmin" = true WHERE id = :id',
          {
            replacements: { id: user.id },
            type: QueryTypes.UPDATE
          }
        );
        
        console.log(`Success! User ${user.name} (${user.email}) is now an admin`);
      }
    }
    
    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addIsAdminColumn();