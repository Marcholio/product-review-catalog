import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import sequelize from '../../config/database.js';
import { QueryTypes } from 'sequelize';
import config from '../../config/environment.js';
import { UnauthorizedError } from '../../utils/errors/AppError.js';
import asyncHandler from '../../utils/helpers/asyncHandler.js';

/**
 * Extended request interface with user property
 */
export interface AuthRequest extends Request {
  user?: User;
}

/**
 * Raw user data returned from database query
 */
interface RawUser {
  id: number;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  preferences: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Authentication middleware that verifies JWT token and attaches user to request
 */
export const authenticate = asyncHandler(async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  // Get token from Authorization header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    throw new UnauthorizedError('Authentication required');
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw new UnauthorizedError('Authentication token missing');
  }

  // Verify token
  const decoded = jwt.verify(token, config.auth.jwtSecret) as jwt.JwtPayload;
  if (!decoded || typeof decoded === 'string' || !decoded.id) {
    throw new UnauthorizedError('Invalid authentication token');
  }

  // Find user by ID using raw query for better performance
  const users = await sequelize.query<RawUser>(
    'SELECT * FROM "Users" WHERE id = $1',
    {
      bind: [decoded.id],
      type: QueryTypes.SELECT
    }
  );

  const user = users[0];
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Create a User instance from the raw data
  const userInstance = User.build(user, { isNewRecord: false });
  
  // Ensure the instance is flagged as existing
  Object.defineProperty(userInstance, 'isNewRecord', { value: false });
  
  // Set all fields from the raw data
  Object.assign(userInstance, user);

  // Ensure isAdmin is explicitly set as a boolean
  if (userInstance.isAdmin === undefined || userInstance.isAdmin === null) {
    console.log('Warning: isAdmin is undefined or null for user', decoded.id);
    userInstance.isAdmin = false;
  } else {
    // Convert to boolean explicitly
    userInstance.isAdmin = !!userInstance.isAdmin;
  }
  
  console.log('Auth middleware - User loaded:', {
    id: userInstance.id,
    isAdmin: userInstance.isAdmin,
    type: typeof userInstance.isAdmin
  });
  
  // Attach user to request
  req.user = userInstance;
  next();
});

/**
 * Admin authorization middleware that checks if the user is an admin
 */
export const adminAuth = asyncHandler(async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  // Check if user exists and is authenticated
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  // Check if user is an admin
  if (!req.user.isAdmin) {
    throw new UnauthorizedError('Admin access required');
  }

  // If user is an admin, continue
  next();
});

/**
 * Optional auth middleware that doesn't require authentication 
 * but will attach user to request if token is valid
 */
export const optionalAuth = asyncHandler(async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Get token from Authorization header (if present)
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, config.auth.jwtSecret) as jwt.JwtPayload;
    if (!decoded || typeof decoded === 'string' || !decoded.id) {
      return next();
    }

    // Find user by ID
    const users = await sequelize.query<RawUser>(
      'SELECT * FROM "Users" WHERE id = $1',
      {
        bind: [decoded.id],
        type: QueryTypes.SELECT
      }
    );

    if (users.length > 0) {
      const user = users[0];
      const userInstance = User.build(user, { isNewRecord: false });
      Object.defineProperty(userInstance, 'isNewRecord', { value: false });
      Object.assign(userInstance, user);
      
      // Ensure isAdmin is explicitly set as a boolean
      if (userInstance.isAdmin === undefined || userInstance.isAdmin === null) {
        console.log('Warning: isAdmin is undefined or null for user in optionalAuth', decoded.id);
        userInstance.isAdmin = false;
      } else {
        // Convert to boolean explicitly
        userInstance.isAdmin = !!userInstance.isAdmin;
      }
      
      console.log('Optional auth middleware - User loaded:', {
        id: userInstance.id,
        isAdmin: userInstance.isAdmin,
        type: typeof userInstance.isAdmin
      });
      
      req.user = userInstance;
    }
  } catch (error) {
    // In optional auth, we just continue if token is invalid
  }
  
  next();
});