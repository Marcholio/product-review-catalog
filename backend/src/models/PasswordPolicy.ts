import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

interface PasswordPolicyAttributes {
  id: number;
  minimumPasswordLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  preventPasswordReuse: boolean;
  passwordHistoryCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class PasswordPolicy extends Model<PasswordPolicyAttributes> implements PasswordPolicyAttributes {
  public id!: number;
  public minimumPasswordLength!: number;
  public requireUppercase!: boolean;
  public requireLowercase!: boolean;
  public requireNumbers!: boolean;
  public requireSpecialChars!: boolean;
  public passwordExpiryDays!: number;
  public preventPasswordReuse!: boolean;
  public passwordHistoryCount!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PasswordPolicy.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    minimumPasswordLength: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 8,
    },
    requireUppercase: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    requireLowercase: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    requireNumbers: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    requireSpecialChars: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    passwordExpiryDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90,
    },
    preventPasswordReuse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    passwordHistoryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
  },
  {
    sequelize,
    tableName: 'PasswordPolicies',
    timestamps: true,
  }
);

// Ensure there's always at least one record
const initializePasswordPolicy = async () => {
  const count = await PasswordPolicy.count();
  if (count === 0) {
    await PasswordPolicy.create({
      minimumPasswordLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
      preventPasswordReuse: true,
      passwordHistoryCount: 5,
    });
  }
};

// Run this when the app starts
initializePasswordPolicy()
  .then(() => console.log('Password policy initialized'))
  .catch((err) => console.error('Error initializing password policy:', err));

export default PasswordPolicy;