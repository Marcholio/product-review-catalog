import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

/**
 * Script to add status column to the Reviews table
 */
const addStatusToReviews = async () => {
  try {
    console.log('Checking if status column exists in Reviews table...');
    
    // Check if the column already exists
    const columnsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Reviews' AND column_name='status'`,
      { type: QueryTypes.SELECT }
    );
    
    if (columnsCheck.length === 0) {
      console.log('Status column does not exist. Adding it...');
      
      // Add the status column with a default value of 'approved' to maintain backward compatibility
      await sequelize.query(
        `ALTER TABLE "Reviews" ADD COLUMN "status" VARCHAR(255) DEFAULT 'approved' NOT NULL`,
        { type: QueryTypes.RAW }
      );
      
      console.log('Status column added successfully!');
      
      // Update all existing reviews to have 'approved' status by default
      console.log('Setting all existing reviews to "approved" status...');
      await sequelize.query(
        `UPDATE "Reviews" SET "status" = 'approved'`,
        { type: QueryTypes.RAW }
      );
      
      console.log('All existing reviews updated to approved status!');
    } else {
      console.log('Status column already exists.');
    }
    
    console.log('Script completed successfully!');
  } catch (error) {
    console.error('Error adding status column to Reviews table:', error);
  } finally {
    await sequelize.close();
  }
};

// Execute the function if this file is run directly
if (process.argv[1] === import.meta.url) {
  addStatusToReviews()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export default addStatusToReviews;