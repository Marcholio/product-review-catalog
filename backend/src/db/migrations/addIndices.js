'use strict';

/**
 * Migration file to add performance-optimizing indices to database tables
 */
export async function up(queryInterface, Sequelize) {
  // Add indices to the Products table
  await queryInterface.addIndex('Products', ['category'], {
    name: 'products_category_idx',
    comment: 'Improves filtering by category'
  });

  await queryInterface.addIndex('Products', ['price'], {
    name: 'products_price_idx',
    comment: 'Improves filtering by price range and sorting by price'
  });

  await queryInterface.addIndex('Products', ['rating'], {
    name: 'products_rating_idx',
    comment: 'Improves sorting by rating'
  });

  await queryInterface.addIndex('Products', ['createdAt'], {
    name: 'products_created_at_idx',
    comment: 'Improves sorting by creation date'
  });

  // Add text search indices for name and description
  await queryInterface.addIndex('Products', ['name'], {
    name: 'products_name_idx',
    comment: 'Improves text search on product names',
    type: 'FULLTEXT', // For MySQL, use GIN for PostgreSQL
  });

  await queryInterface.addIndex('Products', ['description'], {
    name: 'products_description_idx',
    comment: 'Improves text search on product descriptions',
    type: 'FULLTEXT', // For MySQL, use GIN for PostgreSQL
  });

  // Add indices to the Reviews table
  await queryInterface.addIndex('Reviews', ['productId'], {
    name: 'reviews_product_id_idx',
    comment: 'Improves joins with Products table and filtering by product'
  });

  await queryInterface.addIndex('Reviews', ['rating'], {
    name: 'reviews_rating_idx',
    comment: 'Improves aggregation of ratings'
  });
}

export async function down(queryInterface, Sequelize) {
  // Remove indices from Products table
  await queryInterface.removeIndex('Products', 'products_category_idx');
  await queryInterface.removeIndex('Products', 'products_price_idx');
  await queryInterface.removeIndex('Products', 'products_rating_idx');
  await queryInterface.removeIndex('Products', 'products_created_at_idx');
  await queryInterface.removeIndex('Products', 'products_name_idx');
  await queryInterface.removeIndex('Products', 'products_description_idx');

  // Remove indices from Reviews table
  await queryInterface.removeIndex('Reviews', 'reviews_product_id_idx');
  await queryInterface.removeIndex('Reviews', 'reviews_rating_idx');
}