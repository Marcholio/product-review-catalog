import type { Product } from './Product';

export type WishlistItem = {
  id: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  Product: Product;
}; 