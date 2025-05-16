import type { Product } from './ProductType';

export interface WishlistItem {
  id: number | string;
  productId: number | string;
  createdAt: string;
  updatedAt: string;
  Product: Product;
}

export default WishlistItem;