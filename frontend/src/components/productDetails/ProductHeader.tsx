import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiUser, FiStar, FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { Card, Button } from '../ui';
import type { Product } from '../../types/ProductType';
import ImageWithFallback from '../ImageWithFallback';
import { useCart } from '../../contexts/CartContext';

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
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'number' ? price : Number(price);
    return numPrice.toFixed(2);
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
        id="onboarding-back-button"
      >
        <FiArrowLeft className="mr-2" />
        Back to Products
      </button>

      <Card variant="elevated" className="mb-12 overflow-hidden" id="onboarding-product-card">
        <div className="md:flex">
          <div className="md:w-1/2 relative" id="onboarding-product-image-container">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent z-10"></div>
            <ImageWithFallback
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-96 object-cover transition-transform duration-500 hover:scale-105"
              fallbackClassName="w-full h-96"
              id="onboarding-product-image"
            />
            {Number(averageRating) >= 4.5 && (
              <div className="absolute top-4 right-4 bg-amber-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center z-20">
                <FiStar className="mr-1" />
                Featured Product
              </div>
            )}
          </div>
          <div className="p-8 md:w-1/2" id="onboarding-product-info">
            <h1 className="text-3xl font-bold mb-4 text-gray-900" id="onboarding-product-name">{product.name}</h1>
            <p className="text-gray-600 mb-6" id="onboarding-product-description">{product.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg px-4 py-2 flex items-center" id="onboarding-product-price">
                <span className="text-2xl font-bold text-blue-600">
                  €{formatPrice(product.price)}
                </span>
              </div>
              <div className="bg-gray-100 rounded-full px-4 py-2 text-gray-600 text-sm font-medium flex items-center" id="onboarding-product-category">
                {product.category}
              </div>
            </div>
            
            <div className="mb-6" id="onboarding-product-rating">
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
            
            {/* Quantity selector */}
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center">
                <div className="flex items-center h-10 w-32 rounded-md border border-gray-300 bg-white shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors border-r border-gray-300 bg-white"
                    aria-label="Decrease quantity"
                  >
                    <div className="flex items-center justify-center">
                      <span className="font-bold text-lg">-</span>
                    </div>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-white text-center font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors border-l border-gray-300 bg-white"
                    aria-label="Increase quantity"
                  >
                    <div className="flex items-center justify-center">
                      <span className="font-bold text-lg">+</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Add to Cart button */}
              <Button
                onClick={() => addItem(product, quantity)}
                variant="primary"
                leftIcon={<FiShoppingCart />}
                className="mr-2 text-white"
                style={{color: 'white !important'}}
                id="add-to-cart-button"
              >
                Add to Cart
              </Button>
              
              {/* Wishlist button */}
              {isLoggedIn ? (
                <Button
                  onClick={onWishlistToggle}
                  variant={isInWishlist ? 'danger' : 'secondary'}
                  leftIcon={<FiHeart className={isInWishlist ? 'fill-current' : ''} />}
                  aria-label="Add to wishlist"
                  id="onboarding-wishlist-button"
                >
                  {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  variant="secondary"
                  leftIcon={<FiUser />}
                  id="onboarding-login-button"
                >
                  Login to Add to Wishlist
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ProductHeader;