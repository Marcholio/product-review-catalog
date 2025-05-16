import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Product } from '../types/ProductType';
import type { Review } from '../types/ReviewType';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { FiMessageSquare } from 'react-icons/fi';
import { ErrorMessage } from './ui';

// Direct imports to avoid module resolution issues
import ProductDetailsSkeleton from './productDetails/ProductDetailsSkeleton';
import ProductHeader from './productDetails/ProductHeader';
import RatingSummary from './productDetails/RatingSummary';
import ReviewForm from './productDetails/ReviewForm';
import ReviewList from './productDetails/ReviewList';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        // Always fetch product and reviews
        const [productResponse, reviewsResponse] = await Promise.all([
          fetch(`${API_URL}/products/${id}`),
          fetch(`${API_URL}/reviews/product/${id}`),
        ]);

        if (!productResponse.ok) {
          throw new Error('Failed to fetch product details');
        }
        if (!reviewsResponse.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const productResponseData = await productResponse.json();
        const reviewsResponseData = await reviewsResponse.json();
        
        // Handle new response format with data field
        const productData = productResponseData.success && productResponseData.data 
          ? productResponseData.data 
          : productResponseData;
          
        const reviewsData = reviewsResponseData.success && reviewsResponseData.data
          ? reviewsResponseData.data
          : reviewsResponseData;
        
        setProduct(productData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        
        // Only fetch wishlist if user is authenticated
        if (token) {
          const wishlistResponse = await fetch(`${API_URL}/wishlist`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (wishlistResponse.ok) {
            const wishlistResponseData = await wishlistResponse.json();
            
            // Handle new response format with data field
            const wishlistData = wishlistResponseData.success && wishlistResponseData.data
              ? wishlistResponseData.data
              : wishlistResponseData;
              
            setIsInWishlist(
              Array.isArray(wishlistData) && 
              wishlistData.some((item: any) => item.productId === parseInt(id!, 10))
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id, token]);

  const handleReviewSubmit = async (reviewData: { rating: number; comment: string; userName: string }) => {
    setIsSubmittingReview(true);
    try {
      // Use the user's name from auth if available
      const review = {
        ...reviewData,
        userName: user ? user.name : reviewData.userName,
      };
      
      const response = await fetch(`${API_URL}/reviews/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const responseData = await response.json();
      
      // Handle new response format with data field
      const newReview = responseData.success && responseData.data
        ? responseData.data
        : responseData;
        
      setReviews([newReview, ...reviews]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (!token) {
        return;
      }
      
      const method = isInWishlist ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/wishlist/product/${id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isInWishlist ? 'remove from' : 'add to'} wishlist`);
      }

      setIsInWishlist(!isInWishlist);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full px-4 py-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-xl shadow-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="w-full px-4 py-8" id="onboarding-product-details">
      {/* Product Header Section */}
      <ProductHeader 
        product={product}
        averageRating={averageRating}
        reviewCount={reviews.length}
        isLoggedIn={!!user}
        isInWishlist={isInWishlist}
        onWishlistToggle={handleWishlistToggle}
      />

      {/* Reviews Section */}
      <div className="mb-12" id="reviews">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center" id="onboarding-reviews-title">
          <FiMessageSquare className="mr-2 text-blue-600" />
          Customer Reviews
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Rating Summary Card */}
          <div className="lg:col-span-1" id="onboarding-rating-summary">
            <RatingSummary reviews={reviews} />
          </div>
          
          {/* Review Form */}
          <div className="lg:col-span-2" id="review-form">
            <ReviewForm 
              onSubmit={handleReviewSubmit}
              isSubmitting={isSubmittingReview}
              userName={user ? user.name : ''}
              isUserLoggedIn={!!user}
            />
          </div>
        </div>
        
        {/* Reviews List */}
        <ReviewList reviews={reviews} id="onboarding-review-list" />
      </div>
    </div>
  );
};

export default ProductDetails;