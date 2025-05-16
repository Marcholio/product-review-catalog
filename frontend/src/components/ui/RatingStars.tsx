import React from 'react';
import { FiStar } from 'react-icons/fi';

export type RatingSize = 'xs' | 'sm' | 'md' | 'lg';
export type RatingVariant = 'filled' | 'outline';

interface RatingStarsProps {
  rating: number;
  size?: RatingSize;
  variant?: RatingVariant;
  maxStars?: number;
  className?: string;
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'md',
  variant = 'filled',
  maxStars = 5,
  className = '',
  showValue = false,
  interactive = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">
        {[...Array(maxStars)].map((_, index) => {
          const effectiveRating = hoverRating !== null ? hoverRating : rating;
          const isFilled = index < Math.floor(effectiveRating);
          const isPartiallyFilled = 
            index === Math.floor(effectiveRating) && 
            effectiveRating % 1 !== 0;
          
          let starColor = isFilled ? 'text-amber-500' : 'text-gray-300';
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              onMouseEnter={() => interactive && setHoverRating(index + 1)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${sizeClass[size]} ${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none transition-transform duration-200 ${interactive ? 'hover:scale-110' : ''} bg-transparent`}
              aria-label={`${index + 1} stars`}
              disabled={!interactive}
              tabIndex={interactive ? 0 : -1}
            >
              {variant === 'filled' ? (
                <span className={`${starColor} drop-shadow-sm`}>★</span>
              ) : (
                <FiStar 
                  className={`${starColor} drop-shadow-sm`}
                  fill={isFilled ? 'currentColor' : 'none'}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;