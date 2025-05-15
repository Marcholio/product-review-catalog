import React, { useState } from 'react';
import { FiShoppingBag } from 'react-icons/fi';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
  };

  if (imageError || !src) {
    return (
      <div className={`bg-gradient-to-r from-blue-100 to-indigo-100 flex justify-center items-center ${fallbackClassName || className}`}>
        <FiShoppingBag className="h-16 w-16 text-blue-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;