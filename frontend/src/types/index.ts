// Product type
export interface Product {
  id: number | string;
  name: string;
  description: string;
  price: number | string;
  imageUrl: string;
  category: string;
  rating: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Review type
export interface Review {
  id: number | string;
  productId: number | string;
  userId?: number | string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// WishlistItem type
export interface WishlistItem {
  id: number | string;
  productId: number | string;
  createdAt: string;
  updatedAt: string;
  Product: Product;
}