import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpass',
  database: process.env.DB_NAME || 'product_catalog'
});

async function rejectReview(reviewId: string) {
  const client = await pool.connect();
  
  try {
    console.log(`Starting rejection of review ${reviewId}...`);
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Update the review status
    const updateResult = await client.query(`
      UPDATE "Reviews" 
      SET "status" = 'rejected'
      WHERE "id" = $1
    `, [reviewId]);
    
    console.log(`Updated ${updateResult.rowCount} reviews.`);
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('Rejection completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during rejection:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Get review ID from command line arguments
const reviewId = process.argv[2];

if (!reviewId) {
  console.error('Please provide a review ID as a command line argument');
  process.exit(1);
}

// Run the rejection
rejectReview(reviewId)
  .then(() => {
    console.log('Rejection script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Rejection script failed:', error);
    process.exit(1);
  });