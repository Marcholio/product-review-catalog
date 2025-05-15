import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Product from './Product.js';

interface WishlistAttributes {
  id?: number;
  productId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Wishlist extends Model<WishlistAttributes> implements WishlistAttributes {
  public id!: number;
  public productId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wishlist.init(
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
  },
  {
    sequelize,
    modelName: 'Wishlist',
  }
);

// Set up the association
Wishlist.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });

export default Wishlist; 