import React from 'react';
import type { Product } from '../../types/ProductType';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  onProductClick: (productId: string) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  onProductClick,
}) => {
  const featuredProducts = products.filter(product => product.rating >= 4.5).slice(0, 4);
  
  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <a href="#all-products" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
          View all products
          <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <ProductCard
            key={`featured-${product.id}`}
            product={product}
            isFeatured={true}
            onClick={onProductClick}
            className="shadow-md hover:shadow-lg"
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;