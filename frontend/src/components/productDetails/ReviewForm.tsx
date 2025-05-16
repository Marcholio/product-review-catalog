import React, { useState } from 'react';
import { FiCheck, FiStar, FiUser } from 'react-icons/fi';
import { Card, Button } from '../ui';

interface ReviewFormProps {
  onSubmit: (reviewData: { rating: number; comment: string; userName: string }) => Promise<void>;
  isSubmitting: boolean;
  userName: string;
  isUserLoggedIn: boolean;
  reviewSubmitted?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  isSubmitting,
  userName,
  isUserLoggedIn,
  reviewSubmitted = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    userName: userName,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newReview);
  };

  return (
    <Card variant="default" className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
        <FiStar className="mr-2 text-blue-600" />
        {reviewSubmitted ? 'Thank You for Your Review!' : 'Write a Review'}
      </h3>
      
      {reviewSubmitted ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-blue-700">
          <h4 className="font-medium mb-2 flex items-center">
            <FiCheck className="mr-2" />
            Your review has been submitted!
          </h4>
          <p>
            Thank you for sharing your opinion! Your review is now pending approval 
            by our moderators and will be published soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Your Rating</label>
            <div className="flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="text-3xl focus:outline-none transition-all duration-200 hover:scale-110 transform p-1 bg-white hover:bg-gray-50 rounded-full"
                    aria-label={`Rate ${star} stars`}
                  >
                    <span className={
                      hoverRating !== null
                        ? star <= hoverRating
                          ? "text-amber-400"
                          : "text-gray-300"
                        : star <= newReview.rating
                          ? "text-amber-400"
                          : "text-gray-300"
                    }>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <div className="ml-3 px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                <span className="font-medium text-gray-700">
                  {newReview.rating} {newReview.rating === 1 ? 'Star' : 'Stars'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Your Name</label>
            <div className="relative">
              <input
                type="text"
                value={newReview.userName}
                onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                required
                disabled={isUserLoggedIn}
                placeholder="Enter your name"
                style={{ WebkitTextFillColor: isUserLoggedIn ? 'gray' : 'inherit' }}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Your Review</label>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
            rows={4}
            required
            placeholder="Share your experience with this product..."
          />
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={!isSubmitting ? <FiCheck /> : undefined}
        >
          Submit Review
        </Button>
      </form>
      )}
    </Card>
  );
};

export default ReviewForm;