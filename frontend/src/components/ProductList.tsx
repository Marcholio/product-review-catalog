import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/index.d';
import { API_URL } from '../config';

const ProductList: React.FC = () => {
  const { user, updatePreferences, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(user?.preferences?.defaultSort || 'createdAt');
  const [selectedCategory, setSelectedCategory] = useState(user?.preferences?.defaultCategory || '');
  const [maxBudget, setMaxBudget] = useState<number | ''>(user?.preferences?.maxBudget || '');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, sortBy, selectedCategory, maxBudget]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        sort: sortBy,
        ...(selectedCategory && { category: selectedCategory }),
        ...(maxBudget && { maxBudget: maxBudget.toString() })
      });

      const response = await fetch(`${API_URL}/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
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

  const handleBudgetChange = async (budget: number | '') => {
    setMaxBudget(budget);
    if (user && token) {
      try {
        await updatePreferences({ maxBudget: budget === '' ? undefined : budget });
      } catch (err) {
        console.error('Error updating budget preference:', err);
        if (err instanceof Error && err.message !== 'Not authenticated') {
          setError(err.message);
        }
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="rating">Highest Rated</option>
            <option value="popularity">Most Popular</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label htmlFor="budget" className="whitespace-nowrap">Max Budget:</label>
            <input
              type="number"
              id="budget"
              value={maxBudget}
              onChange={(e) => handleBudgetChange(e.target.value ? Number(e.target.value) : '')}
              placeholder="No limit"
              min="0"
              className="w-32 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList; 