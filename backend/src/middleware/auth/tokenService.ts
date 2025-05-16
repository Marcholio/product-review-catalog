import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';
import config from '../../config/environment.js';
import type User from '../../models/User.js';
import { InternalServerError } from '../../utils/errors/AppError.js';

/**
 * Token payload interface
 */
interface TokenPayload {
  id: number;
  email: string;
  isAdmin?: boolean;
}

/**
 * Generate a JWT token for a user
 * @param user - User object or any object with id and email
 * @returns Signed JWT token string
 */
export const generateToken = (user: User | any): string => {
  // Extract user ID and email from object
  const userId = user?.id || (user?.dataValues?.id);
  const userEmail = user?.email || (user?.dataValues?.email);
  
  // Validate user data
  if (!userId || !userEmail) {
    throw new InternalServerError('Invalid user data for token generation');
  }

  // Create token payload
  const payload: TokenPayload = {
    id: userId,
    email: userEmail,
    isAdmin: user?.isAdmin || false
  };

  // Set JWT options
  const options: SignOptions = {
    expiresIn: config.auth.jwtExpiresIn,
    algorithm: 'HS256' as Algorithm,
  };

  // Sign and return token
  return jwt.sign(
    payload,
    config.auth.jwtSecret,
    options
  );
};

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
  } catch (error) {
    throw new InternalServerError('Invalid token');
  }
};

export default {
  generateToken,
  verifyToken
};