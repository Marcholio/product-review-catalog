export type Review = {
  id: number;
  productId: number;
  rating: number;
  comment: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}; 