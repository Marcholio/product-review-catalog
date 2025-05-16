import { Request, Response } from 'express';
import PasswordPolicy from '../models/PasswordPolicy.js';
import { AuthRequest } from '../middleware/auth/authMiddleware.js';
import asyncHandler from '../utils/helpers/asyncHandler.js';

/**
 * Get the current password policy
 */
export const getPasswordPolicy = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Get the current policy (should only be one record)
    const policy = await PasswordPolicy.findOne();
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Password policy not found'
      });
    }
    
    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Error fetching password policy:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching password policy', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Update the password policy
 */
export const updatePasswordPolicy = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const {
      minimumPasswordLength,
      requireUppercase,
      requireLowercase,
      requireNumbers,
      requireSpecialChars,
      passwordExpiryDays,
      preventPasswordReuse,
      passwordHistoryCount
    } = req.body;
    
    // Validate input
    if (minimumPasswordLength !== undefined && (minimumPasswordLength < 6 || minimumPasswordLength > 32)) {
      return res.status(400).json({
        success: false,
        message: 'Minimum password length must be between 6 and 32'
      });
    }
    
    if (passwordExpiryDays !== undefined && passwordExpiryDays < 0) {
      return res.status(400).json({
        success: false,
        message: 'Password expiry days must be 0 or greater'
      });
    }
    
    if (passwordHistoryCount !== undefined && (passwordHistoryCount < 1 || passwordHistoryCount > 24)) {
      return res.status(400).json({
        success: false,
        message: 'Password history count must be between 1 and 24'
      });
    }
    
    // Get the current policy (should only be one record)
    let policy = await PasswordPolicy.findOne();
    
    if (!policy) {
      // Create if it doesn't exist
      policy = await PasswordPolicy.create({
        minimumPasswordLength: minimumPasswordLength ?? 8,
        requireUppercase: requireUppercase ?? true,
        requireLowercase: requireLowercase ?? true,
        requireNumbers: requireNumbers ?? true,
        requireSpecialChars: requireSpecialChars ?? true,
        passwordExpiryDays: passwordExpiryDays ?? 90,
        preventPasswordReuse: preventPasswordReuse ?? true,
        passwordHistoryCount: passwordHistoryCount ?? 5
      });
    } else {
      // Update existing policy
      await policy.update({
        minimumPasswordLength: minimumPasswordLength ?? policy.minimumPasswordLength,
        requireUppercase: requireUppercase ?? policy.requireUppercase,
        requireLowercase: requireLowercase ?? policy.requireLowercase,
        requireNumbers: requireNumbers ?? policy.requireNumbers,
        requireSpecialChars: requireSpecialChars ?? policy.requireSpecialChars,
        passwordExpiryDays: passwordExpiryDays ?? policy.passwordExpiryDays,
        preventPasswordReuse: preventPasswordReuse ?? policy.preventPasswordReuse,
        passwordHistoryCount: passwordHistoryCount ?? policy.passwordHistoryCount
      });
    }
    
    res.json({
      success: true,
      data: policy
    });
  } catch (error) {
    console.error('Error updating password policy:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating password policy', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Validate a password against the current policy
 * @param password The password to validate
 * @returns { isValid: boolean, errors: string[] } Validation result with any errors
 */
export const validatePasswordAgainstPolicy = async (password: string): Promise<{ isValid: boolean, errors: string[] }> => {
  try {
    // Get the current policy
    const policy = await PasswordPolicy.findOne();
    
    if (!policy) {
      // If no policy exists, use default minimum length of 6
      return password.length >= 6 
        ? { isValid: true, errors: [] }
        : { isValid: false, errors: ['Password must be at least 6 characters long'] };
    }
    
    const errors: string[] = [];
    
    // Check minimum length
    if (password.length < policy.minimumPasswordLength) {
      errors.push(`Password must be at least ${policy.minimumPasswordLength} characters long`);
    }
    
    // Check for uppercase letters
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must include at least one uppercase letter');
    }
    
    // Check for lowercase letters
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must include at least one lowercase letter');
    }
    
    // Check for numbers
    if (policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must include at least one number');
    }
    
    // Check for special characters
    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must include at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error validating password against policy:', error);
    return {
      isValid: true, // Default to valid in case of error
      errors: []
    };
  }
};