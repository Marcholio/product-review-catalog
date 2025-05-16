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

export default Review;