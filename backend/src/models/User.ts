import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id?: number;
  email: string;
  password: string;
  name: string;
  preferences?: {
    defaultSort?: string;
    defaultCategory?: string;
    theme?: 'light' | 'dark';
    maxBudget?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public name!: string;
  public preferences!: {
    defaultSort?: string;
    defaultCategory?: string;
    theme?: 'light' | 'dark';
    maxBudget?: number;
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      console.log('Password comparison debug:');
      console.log('- Has candidate password:', !!candidatePassword);
      console.log('- Has stored password:', !!this.password);
      console.log('- Stored password type:', typeof this.password);
      console.log('- Stored password length:', this.password?.length);

      if (!candidatePassword || !this.password) {
        console.log('Missing password in comparison');
        return false;
      }

      const result = await bcrypt.compare(candidatePassword, this.password);
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
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        defaultSort: 'createdAt',
        defaultCategory: '',
        theme: 'light',
        maxBudget: null
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
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
            user.setDataValue('password', hashedPassword);
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
            user.setDataValue('password', hashedPassword);
          } catch (error) {
            console.error('Password hashing error:', error);
            throw error;
          }
        }
      },
    },
  }
);

export default User; 