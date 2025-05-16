import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/ProductType';
import { API_URL } from '../config';
import { ErrorMessage } from './ui';
import {
  FilterSection,
  HeroSection,
  FeaturedProducts,
  ProductGrid,
  Pagination
} from './products';

// Constants
const MAX_PRICE = 2000;

const ProductList: React.FC = () => {
  const { user, updatePreferences, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState(user?.preferences?.defaultSort || 'createdAt');
  const [selectedCategory, setSelectedCategory] = useState(user?.preferences?.defaultCategory || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([
    user?.preferences?.minBudget || 0,
    user?.preferences?.maxBudget || MAX_PRICE
  ]);
  const [debouncedBudgetRange, setDebouncedBudgetRange] = useState<[number, number]>(budgetRange);
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce budget range changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBudgetRange(budgetRange);
      setCurrentPage(1); // Reset to first page when budget changes
    }, 400);

    return () => clearTimeout(timer);
  }, [budgetRange]);

  // Use debounced values for API calls
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, sortBy, selectedCategory, debouncedBudgetRange, debouncedSearchQuery]);

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        sort: sortBy,
        ...(selectedCategory && { category: selectedCategory }),
        ...(debouncedBudgetRange[0] > 0 && { minBudget: debouncedBudgetRange[0].toString() }),
        ...(debouncedBudgetRange[1] < MAX_PRICE && { maxBudget: debouncedBudgetRange[1].toString() }),
        ...(debouncedSearchQuery.trim() && { search: debouncedSearchQuery.trim() })
      });

      // Better debug logging
      console.log('Fetching products with params:', {
        page: currentPage,
        sort: sortBy,
        category: selectedCategory || 'All',
        budgetRange: debouncedBudgetRange,
        searchQuery: debouncedSearchQuery
      });
      
      const response = await fetch(`${API_URL}/products?${queryParams}`);
      
      if (!response.ok) {
        // Try to parse error response if possible
        let errorMessage = 'Failed to fetch products';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('API error details:', errorData);
        } catch (e) {
          // If we can't parse the JSON, just use the status text
          errorMessage = `Failed to fetch products: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      
      // Check for new response format (with data field) or old format
      const data = responseData.success && responseData.data 
        ? responseData.data 
        : responseData;
        
      console.log('Products fetched successfully:', {
        count: data.products?.length || 0,
        totalPages: data.totalPages,
        totalProducts: data.totalProducts
      });
      
      // Removed artificial delay to improve performance
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/products/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const responseData = await response.json();
      
      // Check for new response format (with data field) or old format
      const categories = responseData.success && responseData.data 
        ? responseData.data 
        : responseData;
        
      setCategories(Array.isArray(categories) ? categories : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Memoize all event handlers with useCallback to prevent unnecessary re-renders
  const handleSortChange = useCallback(async (newSort: string) => {
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
  }, [user, token, updatePreferences, setError]);

  const handleCategoryChange = useCallback(async (category: string) => {
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
  }, [user, token, updatePreferences, setError]);

  const handleBudgetRangeChange = useCallback((newRange: [number, number]) => {
    // Ensure min <= max and round values for better UX
    const roundedMin = Math.floor(newRange[0] / 10) * 10;
    const roundedMax = Math.ceil(newRange[1] / 10) * 10;
    
    // Prevent reverse range (min > max)
    if (roundedMin <= roundedMax) {
      setBudgetRange([roundedMin, roundedMax]);
    }
  }, [setBudgetRange]);

  const handleBudgetRangeBlur = useCallback(async () => {
    if (user && token) {
      try {
        await updatePreferences({
          minBudget: budgetRange[0] > 0 ? budgetRange[0] : undefined,
          maxBudget: budgetRange[1] < MAX_PRICE && budgetRange[1] !== MAX_PRICE ? budgetRange[1] : undefined
        });
      } catch (err) {
        console.error('Error updating budget preferences:', err);
        if (err instanceof Error && err.message !== 'Not authenticated') {
          setError(err.message);
        }
      }
    }
  }, [user, token, budgetRange, updatePreferences, setError, MAX_PRICE]);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/products/${productId}`);
  }, [navigate]);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <div className="py-4 sm:py-6 lg:py-8 w-full">
        <div className="w-full">
          {/* Hero Section */}
          <HeroSection isLoggedIn={!!user} />

          {/* Filters Section */}
          <FilterSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            handleSortChange={handleSortChange}
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
            budgetRange={budgetRange}
            handleBudgetRangeChange={handleBudgetRangeChange}
            handleBudgetRangeBlur={handleBudgetRangeBlur}
            categories={categories}
            maxPrice={MAX_PRICE}
          />

          {/* Error Message */}
          {error && (
            <ErrorMessage message={error} className="mb-8" />
          )}

          {/* Featured Products Section */}
          {!loading && products.some(p => p.rating >= 4.5) && (
            <FeaturedProducts 
              products={products} 
              onProductClick={handleProductClick}
            />
          )}

          {/* All Products Section */}
          <ProductGrid 
            products={products} 
            loading={loading} 
            onProductClick={handleProductClick}
          />

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;