import React from 'react';
import type { Product } from '../../types/ProductType';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductClick: (productId: string) => void;
  skeletonCount?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  onProductClick,
  skeletonCount = 8,
}) => {
  return (
    <div id="all-products" className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

export default ProductGrid;