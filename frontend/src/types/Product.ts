export type Product = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  imageUrl: string;
  category: string;
  rating: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}; 