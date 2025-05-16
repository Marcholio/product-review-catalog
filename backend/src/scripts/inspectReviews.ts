import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpass',
  database: process.env.DB_NAME || 'product_catalog'
});

async function inspectReviews() {
  const client = await pool.connect();
  
  try {
    console.log('Inspecting Reviews table...');
    
    // Check table structure
    const tableInfoResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Reviews'
      ORDER BY ordinal_position
    `);
    
    console.log('\nTable structure:');
    console.table(tableInfoResult.rows);
    
    // Count reviews by status
    const statusCountResult = await client.query(`
      SELECT "status", COUNT(*) as count
      FROM "Reviews"
      GROUP BY "status"
    `);
    
    console.log('\nReview counts by status:');
    console.table(statusCountResult.rows);
    
    // Show all reviews
    const reviewsResult = await client.query(`
      SELECT id, "productId", rating, "userName", "status", "createdAt"
      FROM "Reviews"
      ORDER BY "createdAt" DESC
    `);
    
    console.log('\nAll reviews:');
    console.table(reviewsResult.rows);
    
    console.log('\nInspection completed successfully!');
  } catch (error) {
    console.error('Error during inspection:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the inspection
inspectReviews()
  .then(() => {
    console.log('Inspection script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Inspection script failed:', error);
    process.exit(1);
  });