import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/index.d';
import { API_URL } from '../config';

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

const ProductList: React.FC = () => {
  const { user, updatePreferences, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(user?.preferences?.defaultSort || 'createdAt');
  const [selectedCategory, setSelectedCategory] = useState(user?.preferences?.defaultCategory || '');
  const [maxBudget, setMaxBudget] = useState<string>(user?.preferences?.maxBudget?.toString() || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [debouncedBudget, setDebouncedBudget] = useState<string>(maxBudget);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the budget value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBudget(maxBudget);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [maxBudget]);

  // Use debouncedBudget for API calls
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, sortBy, selectedCategory, debouncedBudget]);

  const fetchProducts = async () => {
    try {
      setIsSearching(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        sort: sortBy,
        ...(selectedCategory && { category: selectedCategory }),
        ...(debouncedBudget && { maxBudget: debouncedBudget })
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
      setIsSearching(false);
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

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty value or numbers only
    if (value === '' || /^\d*$/.test(value)) {
      setMaxBudget(value);
    }
  };

  const handleBudgetBlur = async () => {
    if (maxBudget) {
      const numericValue = parseInt(maxBudget, 10);
      if (!isNaN(numericValue)) {
        setMaxBudget(numericValue.toString());
        if (user && token) {
          try {
            await updatePreferences({ maxBudget: numericValue });
          } catch (err) {
            console.error('Error updating budget preference:', err);
            if (err instanceof Error && err.message !== 'Not authenticated') {
              setError(err.message);
            }
          }
        }
      }
    } else if (user && token) {
      try {
        await updatePreferences({ maxBudget: undefined });
      } catch (err) {
        console.error('Error updating budget preference:', err);
        if (err instanceof Error && err.message !== 'Not authenticated') {
          setError(err.message);
        }
      }
    }
  };

  const handleBudgetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBudgetBlur();
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

          <div className="relative">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Max Budget
            </label>
            <div className="relative">
              <input
                type="text"
                id="budget"
                value={maxBudget}
                onChange={handleBudgetChange}
                onBlur={handleBudgetBlur}
                onKeyDown={handleBudgetKeyDown}
                placeholder="No limit"
                className="w-32 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 transition-colors duration-200"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {isSearching && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
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