import React, { useState } from 'react';
import { FiShoppingBag } from 'react-icons/fi';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  loading = 'lazy'
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

  // Generate responsive image URLs for srcSet
  const generateSrcSet = () => {
    if (!src) return '';
    
    // Check if the URL already has parameters
    const hasParams = src.includes('?');
    const connector = hasParams ? '&' : '?';
    
    return `${src}${connector}w=300 300w, ${src}${connector}w=600 600w, ${src}${connector}w=900 900w`;
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      loading={loading}
      srcSet={generateSrcSet()}
      sizes={sizes}
      decoding="async"
    />
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(ImageWithFallback);