import { Request, Response } from 'express';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth/index.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { validatePasswordAgainstPolicy } from './passwordPolicyController.js';

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
    
    // Validate password against policy
    const { isValid, errors } = await validatePasswordAgainstPolicy(password);
    if (!isValid) {
      return res.status(400).json({ 
        message: 'Password does not meet security requirements', 
        errors: errors,
        field: 'password'
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    try {
      // Hash the password manually to ensure it's properly stored
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('- Manual hashing for registration:');
      console.log('- Original password length:', password.length);
      console.log('- Hashed password length:', hashedPassword.length);
      
      // Create user with simpler approach
      const userValues = {
        email,
        password: hashedPassword,
        name,
        preferences: {
          theme: 'light',
          defaultSort: 'createdAt',
          defaultCategory: '',
          maxBudget: null,
          minBudget: null
        }
      };
      
      console.log('Attempting to create user with values:', {
        email: userValues.email,
        passwordLength: userValues.password.length,
        name: userValues.name
      });
      
      const user = await User.create(userValues);
      
      // Log the full object structure to debug the issue
      console.log('User after create (complete object):', JSON.stringify({
        id: user.id,
        dataValues: user.dataValues,
        getDataValue: typeof user.getDataValue === 'function',
        safeId: (user as any).safeId
      }));
      
      // Use our safe getter methods to extract data
      const userData = {
        id: (user as any).safeId || user.dataValues.id,
        email: (user as any).safeEmail || user.dataValues.email,
        name: (user as any).safeName || user.dataValues.name,
        isAdmin: (user as any).safeIsAdmin || user.dataValues.isAdmin || false,
        preferences: (user as any).safePreferences || user.dataValues.preferences
      };
      
      console.log('Using dataValues directly:');
      console.log('- User ID:', userData.id);
      console.log('- Email:', userData.email);
      console.log('- Name:', userData.name);
      
      if (!userData.id) {
        console.error('User created but no ID in dataValues!', user.dataValues);
        throw new Error('User creation failed - no ID in dataValues');
      }
      
      // Generate token using the extracted data
      const token = generateToken(userData);
      
      // Return response with the extracted user data
      res.status(201).json({
        user: userData,
        token,
      });
    } catch (innerError) {
      console.error('Inner registration error:', innerError);
      throw innerError;
    }
  } catch (error) {
    // More detailed error logging
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check for Sequelize validation errors
    if (error instanceof Error && 'errors' in error) {
      const sequelizeError = error as any;
      if (Array.isArray(sequelizeError.errors)) {
        console.error('Sequelize validation errors:', 
          sequelizeError.errors.map((e: any) => ({ 
            message: e.message, 
            path: e.path,
            value: e.value 
          }))
        );
      }
    }
    
    // Send appropriate response
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
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

    // Add more debugging for password comparison
    console.log('Password comparison debug:');
    console.log('- Input password length:', password.length);
    console.log('- Stored password from DB:', rawUser.password); 
    console.log('- Stored password type:', typeof rawUser.password);
    console.log('- Stored password length:', rawUser.password.length);
    
    // Check if the stored password is already a hash (should be ~60 chars for bcrypt)
    const isStoredPasswordHashed = rawUser.password.length > 30;
    console.log('- Is the stored password hashed:', isStoredPasswordHashed);
    
    // Compare passwords directly
    let isMatch = false;
    try {
      // If the stored password isn't hashed, try direct comparison (temporary fix)
      if (!isStoredPasswordHashed && password === rawUser.password) {
        console.log('- Direct password match (INSECURE)');
        isMatch = true;
      } else {
        // Otherwise do proper bcrypt comparison
        isMatch = await bcrypt.compare(password, rawUser.password);
        console.log('- Bcrypt comparison result:', isMatch);
      }
    } catch (err) {
      console.error('- Password comparison error:', err);
      // If there's an error in the comparison, try direct comparison as fallback
      isMatch = password === rawUser.password;
      console.log('- Fallback direct comparison:', isMatch);
    }
    
    console.log('Final password comparison result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a minimal user object for token generation
    // Make sure to include all necessary fields
    const userForToken = {
      id: rawUser.id,
      email: rawUser.email,
      name: rawUser.name,
      isAdmin: rawUser.isAdmin || false,
      preferences: rawUser.preferences || {
        theme: 'light',
        defaultSort: 'createdAt',
        defaultCategory: '',
        maxBudget: null,
        minBudget: null
      }
    };

    console.log('User data for token:', userForToken);

    const token = generateToken(userForToken);

    res.json({
      user: userForToken,
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
    const { preferences, password } = req.body;

    console.log('Update preferences debug - Initial state:');
    console.log('- Request user:', user);
    console.log('- Request body has preferences:', !!preferences);
    console.log('- Request body has password:', !!password);

    if (!preferences && !password) {
      return res.status(400).json({ message: 'Either preferences or password must be provided' });
    }

    // Ensure we have a valid user with an ID
    if (!user || !user.id) {
      console.error('Invalid user object:', user);
      return res.status(401).json({ message: 'Invalid user data' });
    }

    // First verify the user exists
    const existingUser = await User.findByPk(user.id);
    if (!existingUser) {
      console.error('User not found in database:', user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const updateData: any = {};
    
    // Handle password update if provided
    if (password) {
      console.log('Password update requested');
      
      // Validate password against policy
      const { isValid, errors } = await validatePasswordAgainstPolicy(password);
      if (!isValid) {
        return res.status(400).json({ 
          message: 'Password does not meet security requirements', 
          errors: errors,
          field: 'password'
        });
      }
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log('- New password hash length:', hashedPassword.length);
      updateData.password = hashedPassword;
    }
    
    // Handle preferences update if provided
    if (preferences) {
      // Get current preferences or initialize empty object
      const currentPreferences = user.preferences || {};
      
      // Update preferences
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      };

      console.log('Preferences update:');
      console.log('- User ID:', user.id);
      console.log('- Current preferences:', currentPreferences);
      console.log('- New preferences:', preferences);
      console.log('- Updated preferences:', updatedPreferences);
      
      updateData.preferences = updatedPreferences;
    }

    // Update user in database using Sequelize's update method
    const [updatedRows] = await User.update(
      updateData,
      { 
        where: { id: user.id },
        returning: true
      }
    );

    console.log('Update result:', { updatedRows });

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch updated user
    const updatedUser = await User.findByPk(user.id);

    if (!updatedUser) {
      console.error('User not found after update:', user.id);
      return res.status(404).json({ message: 'User not found after update' });
    }

    console.log('Update successful:');
    console.log('- Updated user:', {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      isAdmin: !!updatedUser.isAdmin,
      preferences: updatedUser.preferences
    });
    
    // Directly log raw user data to see exactly what's available
    console.log('- Raw updatedUser data:', JSON.stringify(updatedUser));
    console.log('- Raw isAdmin value from database:', updatedUser.isAdmin);
    console.log('- isAdmin type:', typeof updatedUser.isAdmin);

    // Build response carefully with all required fields
    // Ensure we preserve the isAdmin status
    const responseUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      // Make sure we explicitly set isAdmin from the database value
      isAdmin: !!updatedUser.isAdmin, // Convert to boolean explicitly
      preferences: updatedUser.preferences,
    };
    
    console.log('- Sending user response:', responseUser);
    
    res.json({
      user: responseUser,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      message: 'Error updating preferences', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
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
        isAdmin: user.isAdmin || false,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}; 