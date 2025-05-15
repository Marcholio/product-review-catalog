import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Product } from '../types/Product';
import type { Review } from '../types/Review';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';
import { FiArrowLeft, FiHeart, FiShoppingBag, FiStar, FiUser, FiCalendar, FiCheck, FiMessageSquare } from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback';

// Rating Stars Component
const RatingStars = ({ rating, size = 'md' }: { rating: number, size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
  };
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`${sizeClass[size]} ${
            i < rating ? 'text-amber-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// Product Skeleton for loading state
const ProductDetailsSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="h-8 w-40 bg-gray-200 mb-6 rounded-md"></div>
    
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2">
          <div className="w-full h-96 bg-gray-200"></div>
        </div>
        <div className="p-8 md:w-1/2">
          <div className="h-10 bg-gray-200 rounded-md w-3/4 mb-6"></div>
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded-md w-4/6"></div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 rounded-md w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded-full w-1/6"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded-md w-2/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-1/2"></div>
        </div>
      </div>
    </div>
    
    <div className="mt-12">
      <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    userName: user ? user.name : '',
  });

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

        const productData = await productResponse.json();
        const reviewsData = await reviewsResponse.json();
        
        setProduct(productData);
        setReviews(reviewsData);
        
        // Only fetch wishlist if user is authenticated
        if (token) {
          const wishlistResponse = await fetch(`${API_URL}/wishlist`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (wishlistResponse.ok) {
            const wishlistData = await wishlistResponse.json();
            setIsInWishlist(wishlistData.some((item: any) => item.productId === parseInt(id!, 10)));
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      // Use the user's name from auth if available
      const reviewData = {
        ...newReview,
        userName: user ? user.name : newReview.userName,
      };
      
      const response = await fetch(`${API_URL}/reviews/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const review = await response.json();
      setReviews([review, ...reviews]);
      setNewReview({ 
        rating: 5, 
        comment: '', 
        userName: user ? user.name : '' 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (!token) {
        // If user is not authenticated, redirect to login
        navigate('/auth');
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'number' ? price : Number(price);
    return numPrice.toFixed(2);
  };

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
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
      >
        <FiArrowLeft className="mr-2" />
        Back to Products
      </button>

      {/* Product Hero Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12 border border-gray-100">
        <div className="md:flex">
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent z-10"></div>
            <ImageWithFallback
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-96 object-cover transition-transform duration-500 hover:scale-105"
              fallbackClassName="w-full h-96"
            />
            {Number(averageRating) >= 4.5 && (
              <div className="absolute top-4 right-4 bg-amber-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center z-20">
                <FiStar className="mr-1" />
                Featured Product
              </div>
            )}
          </div>
          <div className="p-8 md:w-1/2">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg px-4 py-2 flex items-center">
                <span className="text-2xl font-bold text-blue-600">
                  €{formatPrice(product.price)}
                </span>
              </div>
              <div className="bg-gray-100 rounded-full px-4 py-2 text-gray-600 text-sm font-medium flex items-center">
                {product.category}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className="text-lg font-semibold text-gray-900 mr-2">Rating:</span>
                <div className="flex items-center bg-amber-50 px-3 py-1 rounded-lg">
                  <FiStar className="text-amber-400 mr-1" />
                  <span className="font-bold">
                    {averageRating}
                  </span>
                  <span className="text-gray-500 ml-1">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>
            
            {user ? (
              <button
                onClick={handleWishlistToggle}
                className={`px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 font-medium flex items-center ${
                  isInWishlist
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                <FiHeart className={`mr-2 ${isInWishlist ? 'fill-white' : ''}`} />
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium flex items-center"
              >
                <FiUser className="mr-2" />
                Login to Add to Wishlist
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
          <FiMessageSquare className="mr-2 text-blue-600" />
          Customer Reviews
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Rating Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Rating Summary</h3>
              
              <div className="flex items-center mb-4">
                <span className="text-4xl font-bold text-blue-600 mr-3">{averageRating}</span>
                <div>
                  <RatingStars rating={Number(averageRating)} size="lg" />
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
            </div>
          </div>
          
          {/* Review Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleReviewSubmit} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <FiStar className="mr-2 text-blue-600" />
                Write a Review
              </h3>
              
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
                      disabled={!!user}
                      placeholder="Enter your name"
                      style={{ WebkitTextFillColor: user ? 'gray' : 'inherit' }}
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
              
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium flex items-center"
              >
                {isSubmittingReview ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Reviews List */}
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
                <div 
                  key={review.id} 
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-all duration-300 hover:shadow-lg"
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
                </div>
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
      </div>
    </div>
  );
};

export default ProductDetails; 