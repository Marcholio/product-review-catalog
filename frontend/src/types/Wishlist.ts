import type { Product } from './index';

export type WishlistItem = {
  id: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  Product: Product;
}; 