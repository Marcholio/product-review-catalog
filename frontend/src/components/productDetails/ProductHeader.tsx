import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiUser, FiStar } from 'react-icons/fi';
import { Card, Button } from '../ui';
import type { Product } from '../../types/ProductType';
import ImageWithFallback from '../ImageWithFallback';

interface ProductHeaderProps {
  product: Product;
  averageRating: string | number;
  reviewCount: number;
  isLoggedIn: boolean;
  isInWishlist: boolean;
  onWishlistToggle: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  product,
  averageRating,
  reviewCount,
  isLoggedIn,
  isInWishlist,
  onWishlistToggle,
}) => {
  const navigate = useNavigate();

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'number' ? price : Number(price);
    return numPrice.toFixed(2);
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
      >
        <FiArrowLeft className="mr-2" />
        Back to Products
      </button>

      <Card variant="elevated" className="mb-12 overflow-hidden">
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
                <div className="flex items-center bg-amber-100 px-3 py-1 rounded-lg border border-amber-200 shadow-sm">
                  <FiStar className="text-amber-500 mr-1" />
                  <span className="font-bold text-amber-700">
                    {averageRating}
                  </span>
                  <span className="text-amber-800 ml-1">
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>
            
            {isLoggedIn ? (
              <Button
                onClick={onWishlistToggle}
                variant={isInWishlist ? 'danger' : 'primary'}
                leftIcon={<FiHeart className={isInWishlist ? 'fill-white' : ''} />}
              >
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                variant="primary"
                leftIcon={<FiUser />}
              >
                Login to Add to Wishlist
              </Button>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};

export default ProductHeader;