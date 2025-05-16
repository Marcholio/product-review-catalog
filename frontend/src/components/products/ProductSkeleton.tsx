import React from 'react';
import { Card } from '../ui';

interface ProductSkeletonProps {
  className?: string;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ className = '' }) => {
  return (
    <Card variant="outlined" className={`animate-pulse ${className}`}>
      <div className="relative">
        <div className="w-full h-48 bg-gray-200" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <div className="h-5 bg-gray-200 rounded-md w-3/5 mb-2" />
          <div className="h-5 bg-gray-200 rounded-md w-1/6" />
        </div>
        <div className="h-4 bg-gray-200 rounded-md w-full mb-1" />
        <div className="h-4 bg-gray-200 rounded-md w-4/5 mb-4" />
        <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-md w-1/4" />
          <div className="h-4 bg-gray-200 rounded-md w-1/5" />
        </div>
      </div>
    </Card>
  );
};

export default ProductSkeleton;