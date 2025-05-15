import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'adminpass',
  database: process.env.DB_NAME || 'product_catalog',
  logging: false,
});

export default sequelize; 