import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions, Algorithm } from 'jsonwebtoken';
import User from '../models/User.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import { securityConfig } from '../config/security.js';

interface AuthRequest extends Request {
  user?: any;
}

interface RawUser {
  id: number;
  email: string;
  password: string;
  name: string;
  preferences: any;
  createdAt: Date;
  updatedAt: Date;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Token decoded:', decoded);

      if (!decoded || typeof decoded === 'string' || !decoded.id) {
        console.error('Invalid token payload:', decoded);
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      // Use raw query to ensure we get all fields
      const users = await sequelize.query<RawUser>(
        'SELECT * FROM "Users" WHERE id = $1',
        {
          bind: [decoded.id],
          type: QueryTypes.SELECT
        }
      );

      const user = users[0];

      console.log('User found:', user ? {
        id: user.id,
        email: user.email,
        hasPreferences: !!user.preferences
      } : 'No user');

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Create a User instance with the raw data and set isNewRecord to false
      const userInstance = User.build(user, { isNewRecord: false });
      
      // Force the instance to recognize the data as not new
      Object.defineProperty(userInstance, 'isNewRecord', { value: false });
      
      // Ensure the instance properties are set
      Object.assign(userInstance, user);

      console.log('User instance created:', {
        id: userInstance.id,
        email: userInstance.email,
        hasPreferences: !!userInstance.preferences,
        isNewRecord: userInstance.isNewRecord
      });

      // Attach the user instance to the request
      req.user = userInstance;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const generateToken = (user: User): string => {
  if (!user || !user.id) {
    throw new Error('Invalid user object for token generation');
  }

  if (!securityConfig.jwt.secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const payload = {
    id: user.id,
    email: user.email
  };

  const options: SignOptions = {
    expiresIn: securityConfig.jwt.expiresIn as any,
    algorithm: securityConfig.jwt.algorithm as Algorithm,
    audience: securityConfig.jwt.audience,
    issuer: securityConfig.jwt.issuer
  };

  return jwt.sign(
    payload,
    securityConfig.jwt.secret as Secret,
    options
  );
}; 