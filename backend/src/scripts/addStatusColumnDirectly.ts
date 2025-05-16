import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpass',
  database: process.env.DB_NAME || 'product_catalog'
});

async function addStatusColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Adding status column to Reviews table...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Reviews' AND column_name='status'
    `);
    
    if (checkResult.rows.length === 0) {
      console.log('Status column does not exist. Adding it now...');
      
      // Add the column
      await client.query(`
        ALTER TABLE "Reviews" 
        ADD COLUMN "status" VARCHAR(255) DEFAULT 'approved' NOT NULL
      `);
      
      console.log('Column added successfully!');
      
      // Update all existing reviews to approved status
      const updateResult = await client.query(`
        UPDATE "Reviews" SET "status" = 'approved'
      `);
      
      console.log(`Updated ${updateResult.rowCount} existing reviews to 'approved' status.`);
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log('Migration completed successfully!');
    } else {
      console.log('Status column already exists. No changes needed.');
      await client.query('COMMIT');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
addStatusColumn()
  .then(() => {
    console.log('Migration script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });