import React from 'react';
import type { Product } from '../../types/ProductType';
import ImageWithFallback from '../ImageWithFallback';
import { Card, RatingStars } from '../ui';

interface ProductCardProps {
  product: Product;
  isFeatured?: boolean;
  onClick?: (productId: string) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFeatured = false,
  onClick,
  className = '',
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(product.id);
    }
  };

  return (
    <Card
      variant="outlined"
      hover
      className={`group ${className}`}
      onClick={handleClick}
    >
      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/5 z-10"></div>
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {(isFeatured || product.rating >= 4.5) && (
          <div className="absolute top-2 right-2 bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full text-xs font-medium z-20">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center ml-2">
            <RatingStars 
              rating={Number(product.rating)} 
              size="xs"
              showValue 
              className="product-card-rating"
            />
            {product.reviewCount !== undefined && (
              <span className="ml-2 text-gray-500 text-xs">
                ({product.reviewCount})
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2 h-10">
          {product.description}
        </p>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-base font-bold text-blue-600">
            €{Number(product.price).toFixed(2)}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
            {product.category}
          </span>
        </div>
      </div>
    </Card>
  );
};

// Memoize ProductCard to prevent unnecessary re-renders when parent components change
export default React.memo(ProductCard);