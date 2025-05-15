import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/index.d';
import { API_URL } from '../config';
import { Range } from 'react-range';
import { FiFilter, FiArrowUp, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import type { IconBaseProps } from 'react-icons';
import { useNavigate } from 'react-router-dom';

const IconWrapper: React.FC<IconBaseProps & { icon: React.ComponentType<IconBaseProps> }> = ({ icon: Icon, ...props }) => (
  <Icon {...props} />
);

const ProductSkeleton: React.FC = () => (
  <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden w-full h-[400px]">
    <div className="relative">
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700" />
    </div>
    <div className="p-6">
      <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg w-3/4 mb-2" />
      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-lg w-full mb-2" />
      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/2 mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/4" />
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/4" />
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
  const [categories, setCategories] = useState<string[]>([]);
  const [dragging, setDragging] = useState<null | 'min' | 'max'>(null);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use debounced values for API calls
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, sortBy, selectedCategory, budgetRange, debouncedSearchQuery]);

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        sort: sortBy,
        ...(selectedCategory && { category: selectedCategory }),
        ...(budgetRange[0] > 0 && { minBudget: budgetRange[0].toString() }),
        ...(budgetRange[1] < MAX && { maxBudget: budgetRange[1].toString() }),
        ...(debouncedSearchQuery.trim() && { search: debouncedSearchQuery.trim() })
      });

      console.log('Search query:', debouncedSearchQuery); // Debug log
      console.log('API URL:', `${API_URL}/products?${queryParams}`); // Debug log

      const response = await fetch(`${API_URL}/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
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

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const renderContent = () => (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap gap-4 sm:gap-6 items-center justify-between bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <IconWrapper 
              icon={FiSearch} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <IconWrapper 
              icon={FiArrowUp} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} 
            />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full sm:w-40 pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:border-blue-500"
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>

          <div className="relative w-full sm:w-auto">
            <IconWrapper 
              icon={FiFilter} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} 
            />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full sm:w-40 pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget Range: €{budgetRange[0]} - €{budgetRange[1]}
            </label>
            <div className="relative h-12 flex flex-col justify-center">
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
                renderThumb={({ props }: { props: any }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '24px',
                      width: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #3b82f6',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          [...Array(8)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : (
          products.map((product) => (
            <div 
              key={product.id} 
              onClick={() => handleProductClick(product.id)}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer w-full h-[400px]"
            >
              <div className="relative">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                {product.rating >= 4.5 && (
                  <div className="absolute top-2 right-2 bg-featured-yellow text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-blue-500 transition-colors duration-200">
                  {product.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    <span className="text-featured-yellow">★</span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300 font-medium">
                      {Number(product.rating).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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