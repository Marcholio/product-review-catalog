import React from 'react';
import type { Product } from '../../types/ProductType';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductClick: (productId: string) => void;
  skeletonCount?: number;
  id?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  onProductClick,
  skeletonCount = 8,
  id,
}) => {
  return (
    <div id={id || "all-products"} className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6" id="onboarding-all-products-title">All Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="onboarding-products-container">
        {loading ? (
          // Show skeletons while loading
          [...Array(skeletonCount)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : (
          // Show products when loaded
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={onProductClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Memoize ProductGrid to prevent unnecessary re-renders
export default React.memo(ProductGrid);