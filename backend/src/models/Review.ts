import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Product from './Product.js';

interface ReviewAttributes {
  id?: number;
  productId: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Review extends Model<ReviewAttributes> implements ReviewAttributes {
  public id!: number;
  public productId!: number;
  public rating!: number;
  public comment!: string;
  public userName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Review',
  }
);

// Set up the association
Review.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Review, { foreignKey: 'productId' });

export default Review; 