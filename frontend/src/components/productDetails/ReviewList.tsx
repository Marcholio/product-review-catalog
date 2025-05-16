import React from 'react';
import { FiUser, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { Card, RatingStars } from '../ui';
import type { Review } from '../../types/ReviewType';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
        {reviews.length > 0 ? (
          <>All Reviews ({reviews.length})</>
        ) : (
          <>No Reviews Yet</>
        )}
      </h3>
      
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card 
              key={review.id} 
              variant="outlined"
              className="p-6 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                <div className="mb-2 sm:mb-0">
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <FiUser className="text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900">{review.userName}</span>
                  </div>
                  <div className="flex items-center mt-2 ml-12">
                    <RatingStars rating={review.rating} size="sm" />
                    <span className="ml-2 text-gray-600 text-sm">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1 sm:mt-0">
                  <FiCalendar className="mr-1" />
                  <span>
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              <div className="ml-0 sm:ml-12">
                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FiMessageSquare className="h-8 w-8 text-blue-500" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
          <p className="text-gray-600">Be the first to share your experience with this product.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;