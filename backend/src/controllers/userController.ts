import { Request, Response } from 'express';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

interface RawUser {
  id: number;
  email: string;
  password: string;
  name: string;
  preferences: any;
  createdAt: Date;
  updatedAt: Date;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('Registration debug:');
    console.log('- Email:', email);
    console.log('- Password provided:', !!password);
    console.log('- Password length:', password.length);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password before creating user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('- Hashed password length:', hashedPassword.length);

    // Create user with hashed password
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    console.log('User created debug:');
    console.log('- User ID:', user.id);
    console.log('- Has password:', !!user.password);
    console.log('- Password type:', typeof user.password);
    console.log('- Password length:', user.password?.length);

    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Login attempt debug:');
    console.log('- Email:', email);
    console.log('- Password provided:', !!password);
    console.log('- Password length:', password.length);

    // First check raw database values
    const rawUsers = await sequelize.query<RawUser>(
      'SELECT * FROM "Users" WHERE email = :email',
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );
    const rawUser = rawUsers[0];
    
    console.log('Raw database check:');
    console.log('- Raw user found:', !!rawUser);
    if (rawUser) {
      console.log('- Raw user data:', {
        id: rawUser.id,
        hasPassword: !!rawUser.password,
        passwordLength: rawUser.password?.length
      });
    }

    if (!rawUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords directly
    const isMatch = await bcrypt.compare(password, rawUser.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a user instance for the token
    const user = await User.findByPk(rawUser.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }

    await user.update({ preferences: { ...user.preferences, ...preferences } });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Error updating preferences', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}; 