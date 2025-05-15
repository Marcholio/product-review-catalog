import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

interface ProductAttributes {
  id?: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Product extends Model<ProductAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public imageUrl!: string;
  public category!: string;
  public rating!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Product',
  }
);

export default Product; 