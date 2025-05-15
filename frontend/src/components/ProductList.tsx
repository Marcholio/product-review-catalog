import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/index.d';
import { API_URL } from '../config';
import { Range } from 'react-range';

const ProductSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
    </div>
  </div>
);

const MIN = 0;
const MAX = 1000;

const ProductList: React.FC = () => {
  const { user, updatePreferences, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(user?.preferences?.defaultSort || 'createdAt');
  const [selectedCategory, setSelectedCategory] = useState(user?.preferences?.defaultCategory || '');
  const MAX_PRICE = 2000; // Fixed maximum price
  const [budgetRange, setBudgetRange] = useState<[number, number]>([
    user?.preferences?.minBudget || 0,
    user?.preferences?.maxBudget || MAX_PRICE
  ]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dragging, setDragging] = useState<null | 'min' | 'max'>(null);

  // Use debounced values for API calls
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, sortBy, selectedCategory, budgetRange]);

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        sort: sortBy,
        ...(selectedCategory && { category: selectedCategory }),
        ...(budgetRange[0] > 0 && { minBudget: budgetRange[0].toString() }),
        ...(budgetRange[1] < MAX && { maxBudget: budgetRange[1].toString() })
      });

      const response = await fetch(`${API_URL}/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      // Add a small delay to make the transition smoother
      await new Promise(resolve => setTimeout(resolve, 300));
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSortChange = async (newSort: string) => {
    setSortBy(newSort);
    if (user && token) {
      try {
        await updatePreferences({ defaultSort: newSort });
      } catch (err) {
        console.error('Error updating sort preference:', err);
        if (err instanceof Error && err.message !== 'Not authenticated') {
          setError(err.message);
        }
      }
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    if (user && token) {
      try {
        await updatePreferences({ defaultCategory: category });
      } catch (err) {
        console.error('Error updating category preference:', err);
        if (err instanceof Error && err.message !== 'Not authenticated') {
          setError(err.message);
        }
      }
    }
  };

  const handleBudgetRangeChange = (newRange: [number, number]) => {
    setBudgetRange(newRange);
  };

  const handleBudgetRangeBlur = async () => {
    if (user && token) {
      try {
        await updatePreferences({
          minBudget: budgetRange[0] > 0 ? budgetRange[0] : undefined,
          maxBudget: budgetRange[1] < MAX && budgetRange[1] !== MAX_PRICE ? budgetRange[1] : undefined
        });
      } catch (err) {
        console.error('Error updating budget preferences:', err);
        if (err instanceof Error && err.message !== 'Not authenticated') {
          setError(err.message);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200"
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="relative w-64">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range: €{budgetRange[0]} - €{budgetRange[1]}
            </label>
            <div className="relative h-12 flex flex-col justify-center">
              {/* @ts-ignore */}
              <Range
                step={1}
                min={0}
                max={MAX_PRICE}
                values={budgetRange}
                onChange={(values: number[]) => handleBudgetRangeChange(values as [number, number])}
                onFinalChange={handleBudgetRangeBlur}
                renderTrack={({ props, children }: { props: any; children: React.ReactNode }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '8px',
                      width: '100%',
                      borderRadius: '4px',
                      background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${(budgetRange[0] / MAX_PRICE) * 100}%, #3b82f6 ${(budgetRange[0] / MAX_PRICE) * 100}%, #3b82f6 ${(budgetRange[1] / MAX_PRICE) * 100}%, #e5e7eb ${(budgetRange[1] / MAX_PRICE) * 100}%, #e5e7eb 100%)`,
                      position: 'relative',
                    }}
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props, index }: { props: any; index: number }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '24px',
                      width: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      border: '2px solid #3b82f6',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 2px 6px #aaa',
                    }}
                  />
                )}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>€0</span>
                <span>€{MAX_PRICE}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105"
            >
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{Number(product.rating).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList; 