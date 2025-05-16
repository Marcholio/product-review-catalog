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

export default Product;