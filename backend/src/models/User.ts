import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  name: string;
  isAdmin?: boolean;
  preferences?: {
    defaultSort?: string;
    defaultCategory?: string;
    theme?: 'light' | 'dark';
    maxBudget?: number;
    minBudget?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public isAdmin!: boolean;
  public preferences!: {
    defaultSort?: string;
    defaultCategory?: string;
    theme?: 'light' | 'dark';
    maxBudget?: number;
    minBudget?: number;
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Get properties safely from dataValues if direct access fails
  get safeId(): number {
    return this.id || this.getDataValue('id');
  }
  
  get safeEmail(): string {
    return this.email || this.getDataValue('email');
  }
  
  get safeName(): string {
    return this.name || this.getDataValue('name');
  }
  
  get safePassword(): string {
    return this.password || this.getDataValue('password');
  }
  
  get safeIsAdmin(): boolean {
    // Using || is problematic as it could interpret false as falsy and return next value
    const isAdmin = this.isAdmin !== undefined ? this.isAdmin : this.getDataValue('isAdmin');
    // Cast the result explicitly to boolean
    return isAdmin === true;
  }
  
  get safePreferences(): any {
    return this.preferences || this.getDataValue('preferences') || {};
  }

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      console.log('Password comparison debug:');
      console.log('- Has candidate password:', !!candidatePassword);
      
      const storedPassword = this.safePassword;
      console.log('- Has stored password:', !!storedPassword);
      console.log('- Stored password type:', typeof storedPassword);
      console.log('- Stored password length:', storedPassword?.length);

      if (!candidatePassword || !storedPassword) {
        console.log('Missing password in comparison');
        return false;
      }

      const result = await bcrypt.compare(candidatePassword, storedPassword);
      console.log('- Comparison result:', result);
      return result;
    } catch (error) {
      console.error('Password comparison error:', error);
      return false;
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(60), // bcrypt hashes are always 60 characters
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        defaultSort: 'createdAt',
        defaultCategory: '',
        theme: 'light',
        maxBudget: null,
        minBudget: null
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    // We're now handling password hashing in the controller instead of hooks
    hooks: {
      // Keep hooks for reference but disable them
      /* 
      beforeCreate: async (user: User) => {
        if (user.password) {
          try {
            console.log('Password hashing debug (create):');
            console.log('- Original password type:', typeof user.password);
            console.log('- Original password length:', user.password.length);
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            console.log('- Hashed password length:', hashedPassword.length);
            
            // Explicitly set the hashed password
            user.password = hashedPassword;
          } catch (error) {
            console.error('Password hashing error:', error);
            throw error;
          }
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          try {
            console.log('Password hashing debug (update):');
            console.log('- Original password type:', typeof user.password);
            console.log('- Original password length:', user.password.length);
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            console.log('- Hashed password length:', hashedPassword.length);
            
            // Explicitly set the hashed password
            user.password = hashedPassword;
          } catch (error) {
            console.error('Password hashing error:', error);
            throw error;
          }
        }
      },
      */
    },
  }
);

export default User; 