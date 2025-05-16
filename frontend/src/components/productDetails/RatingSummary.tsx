import React from 'react';
import { FiStar } from 'react-icons/fi';
import { Card, RatingStars } from '../ui';
import type { Review } from '../../types/ReviewType';

interface RatingSummaryProps {
  reviews: Review[];
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ reviews }) => {
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  // Count reviews by rating
  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const calculateRatingPercentage = (rating: number) => {
    const count = ratingCounts[rating] || 0;
    return reviews.length > 0 ? (count / reviews.length) * 100 : 0;
  };

  return (
    <Card variant="default" className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Rating Summary</h3>
      
      <div className="flex items-center mb-4">
        <span className="text-4xl font-bold text-blue-600 mr-3">
          {typeof averageRating === 'string' && averageRating === 'No ratings yet' ? 'N/A' : averageRating}
        </span>
        <div>
          {typeof averageRating === 'string' && averageRating === 'No ratings yet' ? (
            <div className="text-gray-400 text-lg">No ratings</div>
          ) : (
            <RatingStars rating={Number(averageRating)} size="lg" />
          )}
          <p className="text-gray-500 text-sm mt-1">
            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className="flex items-center">
            <div className="w-12 text-sm text-gray-700 font-medium">{rating} stars</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${calculateRatingPercentage(rating)}%` }}
              ></div>
            </div>
            <div className="w-8 text-xs text-gray-500">
              {ratingCounts[rating] || 0}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RatingSummary;