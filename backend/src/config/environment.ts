import dotenv from 'dotenv';
import { BadRequestError } from '../utils/errors/AppError.js';

// Load environment variables
dotenv.config();

/**
 * Environment-specific configuration interface
 */
interface Config {
  env: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  server: {
    port: number;
    host: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    dialect: 'postgres' | 'mysql' | 'sqlite';
    logging: boolean;
    forceSync: boolean;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  rateLimits: {
    enableRateLimits: boolean;
  };
}

// Define and validate the environment
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const isDevelopment = env === 'development';
const isTest = env === 'test';

// Required environment variables for production
if (isProduction) {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  if (missingEnvVars.length > 0) {
    throw new BadRequestError(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
}

// Configuration object with defaults and environment-specific values
const config: Config = {
  env,
  isProduction,
  isDevelopment,
  isTest,
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'product_catalog',
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'adminpass',
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true',
    forceSync: process.env.FORCE_SYNC === 'true'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-for-jwt',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['http://localhost:5173']
  },
  rateLimits: {
    enableRateLimits: 
      process.env.ENABLE_RATE_LIMITS === 'true' || isProduction
  }
};

// Print warning for development JWT secret
if (isDevelopment && !process.env.JWT_SECRET) {
  console.warn('⚠️  Using default JWT secret. Set JWT_SECRET env variable for better security.');
}

export default config;