import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/index.d';
import { API_URL } from '../config';
import { Range } from 'react-range';
import { FiFilter, FiArrowUp, FiChevronLeft, FiChevronRight, FiSearch, FiUser } from 'react-icons/fi';
import type { IconBaseProps } from 'react-icons';
import { useNavigate, Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

const IconWrapper: React.FC<IconBaseProps & { icon: React.ComponentType<IconBaseProps> }> = ({ icon: Icon, ...props }) => (
  <Icon {...props} />
);

const ProductSkeleton: React.FC = () => (
  <div className="group bg-white rounded-xl shadow overflow-hidden border border-gray-100 w-full animate-pulse">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const MAX_PRICE = 2000;
  const [budgetRange, setBudgetRange] = useState<[number, number]>([
    user?.preferences?.minBudget || 0,
    user?.preferences?.maxBudget || MAX_PRICE
  ]);
  const [debouncedBudgetRange, setDebouncedBudgetRange] = useState<[number, number]>(budgetRange);
  const [categories, setCategories] = useState<string[]>([]);
  // Remove unused dragging state as react-range handles this internally
  // const [dragging, setDragging] = useState<null | 'min' | 'max'>(null);
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
    }, 400); // Reduced debounce time for more responsive UI but still prevent too many API calls

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
        ...(debouncedBudgetRange[1] < MAX && { maxBudget: debouncedBudgetRange[1].toString() }),
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
      console.log('API URL:', `${API_URL}/products?${queryParams}`);

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
      
      const data = await response.json();
      console.log('Products fetched successfully:', {
        count: data.products.length,
        totalPages: data.totalPages,
        totalProducts: data.totalProducts
      });
      
      // Small delay to prevent UI flickering
      await new Promise(resolve => setTimeout(resolve, 300));
      setProducts(data.products);
      setTotalPages(data.totalPages);
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
    // Ensure min <= max and round values for better UX
    const roundedMin = Math.floor(newRange[0] / 10) * 10;
    const roundedMax = Math.ceil(newRange[1] / 10) * 10;
    
    // Prevent reverse range (min > max)
    if (roundedMin <= roundedMax) {
      setBudgetRange([roundedMin, roundedMax]);
    }
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

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const renderContent = () => (
    <div className="w-full">
      {/* Hero section */}
      <div className="mb-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-12 md:py-20 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-6 max-w-lg">
              Browse our curated selection of top-rated products with honest reviews from our community.
            </p>
            {!user && (
              <Link 
                to="/auth" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-indigo-700 bg-white hover:bg-blue-50 transition duration-150"
              >
                <FiUser className="mr-2 h-5 w-5" />
                Join Our Community
              </Link>
            )}
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg transform rotate-3 shadow-lg">
                <div className="w-20 h-20 bg-indigo-300/30 rounded-lg mb-2"></div>
                <div className="h-3 bg-white/30 rounded-full w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 rounded-full w-1/2"></div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg transform -rotate-3 shadow-lg mt-8">
                <div className="w-20 h-20 bg-blue-300/30 rounded-lg mb-2"></div>
                <div className="h-3 bg-white/30 rounded-full w-3/4 mb-2"></div>
                <div className="h-3 bg-white/20 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters section */}
      <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Find Your Perfect Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconWrapper 
                    icon={FiSearch} 
                    style={{ color: '#6b7280' }} 
                  />
                </div>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconWrapper 
                    icon={FiArrowUp} 
                    style={{ color: '#6b7280' }} 
                  />
                </div>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition duration-150"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconWrapper 
                    icon={FiFilter} 
                    style={{ color: '#6b7280' }} 
                  />
                </div>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition duration-150"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Price Range: €{budgetRange[0]} - €{budgetRange[1]}
              </label>
              <div className="relative h-12 flex flex-col justify-center">
                <Range
                  step={10}
                  min={0}
                  max={MAX_PRICE}
                  values={budgetRange}
                  onChange={(values: number[]) => handleBudgetRangeChange(values as [number, number])}
                  onFinalChange={handleBudgetRangeBlur}
                  renderTrack={({ props, children, isDragged }: { props: any; children: React.ReactNode; isDragged: boolean }) => (
                    <div
                      onMouseDown={props.onMouseDown}
                      onTouchStart={props.onTouchStart}
                      style={{
                        ...props.style,
                        height: '8px',
                        width: '100%',
                        borderRadius: '4px',
                        background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${(budgetRange[0] / MAX_PRICE) * 100}%, #3b82f6 ${(budgetRange[0] / MAX_PRICE) * 100}%, #3b82f6 ${(budgetRange[1] / MAX_PRICE) * 100}%, #e5e7eb ${(budgetRange[1] / MAX_PRICE) * 100}%, #e5e7eb 100%)`,
                        position: 'relative',
                        cursor: isDragged ? 'grabbing' : 'pointer',
                      }}
                      ref={props.ref}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props, index, isDragged }: { props: any; index: number; isDragged: boolean }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '24px',
                        width: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: isDragged ? '2px solid #2563eb' : '2px solid #3b82f6',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: isDragged 
                          ? '0 0 0 5px rgba(59, 130, 246, 0.1)' 
                          : '0 2px 6px rgba(59, 130, 246, 0.2)',
                        cursor: isDragged ? 'grabbing' : 'grab',
                        touchAction: 'none',
                        // Remove the transform transition
                      }}
                      aria-label={index === 0 ? "Minimum price" : "Maximum price"}
                      role="slider"
                      aria-valuemin={0}
                      aria-valuemax={MAX_PRICE}
                      aria-valuenow={budgetRange[index]}
                      data-thumb-index={index}
                    >
                      <div 
                        className="absolute -top-8 bg-blue-500 text-white text-xs rounded px-2 py-1"
                        style={{
                          opacity: isDragged ? 1 : 0,
                          transition: 'opacity 0.2s ease',
                          pointerEvents: 'none',
                        }}
                      >
                        €{budgetRange[index]}
                      </div>
                    </div>
                  )}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>€0</span>
                  <span>€{MAX_PRICE}</span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>

      {/* Featured Products section - conditional display */}
      {!loading && products.some(p => p.rating >= 4.5) && (
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
            {products
              .filter(product => product.rating >= 4.5)
              .slice(0, 4)
              .map((product) => (
                <div 
                  key={`featured-${product.id}`} 
                  onClick={() => handleProductClick(product.id)}
                  className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-gray-100"
                >
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/10 z-10"></div>
                    <div className="absolute top-3 right-3 bg-amber-400 text-gray-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center z-20">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span>Featured</span>
                    </div>
                    <ImageWithFallback
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span className="ml-1 text-gray-700 font-semibold text-sm">
                          {Number(product.rating).toFixed(1)}
                        </span>
                        {/* Display review count if available */}
                        {product.reviewCount !== undefined && (
                          <span className="ml-2 text-gray-500 text-xs">
                            ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-blue-600">
                        €{Number(product.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All products section */}
      <div id="all-products" className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            [...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : (
            products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product.id)}
                className="group bg-white rounded-xl shadow overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer border border-gray-100"
              >
                <div className="relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/5 z-10"></div>
                  <ImageWithFallback
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.rating >= 4.5 && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full text-xs font-medium z-20">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center ml-2">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="ml-1 text-gray-600 text-xs font-medium">
                        {Number(product.rating).toFixed(1)}
                      </span>
                      {/* Display review count if available */}
                      {product.reviewCount !== undefined && (
                        <span className="ml-2 text-gray-500 text-xs">
                          ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-2 line-clamp-2 h-10">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-base font-bold text-blue-600">
                      €{Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <IconWrapper icon={FiChevronLeft} size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              const isCurrentPage = pageNumber === currentPage;
              const isNearCurrentPage = 
                Math.abs(pageNumber - currentPage) <= 1 || 
                pageNumber === 1 || 
                pageNumber === totalPages;

              if (!isNearCurrentPage) {
                if (pageNumber === 2 || pageNumber === totalPages - 1) {
                  return <span key={pageNumber} className="text-gray-500">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                    ${isCurrentPage 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <IconWrapper icon={FiChevronRight} size={20} />
          </button>
        </div>
      )}
    </div>
  );

  if (error) return <div className="w-full px-4 sm:px-6 lg:px-8 text-center text-red-500">{error}</div>;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <div className="py-4 sm:py-6 lg:py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProductList; 