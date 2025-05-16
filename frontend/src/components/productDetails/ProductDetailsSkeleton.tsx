import React from 'react';
import { Card } from '../ui';

const ProductDetailsSkeleton: React.FC = () => (
  <div className="w-full px-4 py-8 animate-pulse">
    <div className="h-8 w-40 bg-gray-200 mb-6 rounded-md"></div>
    
    <Card variant="elevated" className="mb-12 overflow-hidden">
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
    </Card>
    
    <div className="mt-12">
      <div className="h-8 bg-gray-200 rounded-md w-48 mb-6"></div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} variant="default" className="p-6">
            <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export default ProductDetailsSkeleton;