import React from 'react';
import { Range } from 'react-range';
import { FiFilter, FiArrowUp, FiSearch } from 'react-icons/fi';
import { Card } from '../ui';
import type { IconBaseProps } from 'react-icons';

// IconWrapper helper component
const IconWrapper: React.FC<IconBaseProps & { icon: React.ComponentType<IconBaseProps> }> = ({ 
  icon: Icon, 
  ...props 
}) => (
  <Icon {...props} />
);

interface FilterSectionProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: string;
  handleSortChange: (value: string) => void;
  selectedCategory: string;
  handleCategoryChange: (value: string) => void;
  budgetRange: [number, number];
  handleBudgetRangeChange: (value: [number, number]) => void;
  handleBudgetRangeBlur: () => void;
  categories: string[];
  maxPrice: number;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  handleSortChange,
  selectedCategory,
  handleCategoryChange,
  budgetRange,
  handleBudgetRangeChange,
  handleBudgetRangeBlur,
  categories,
  maxPrice
}) => {
  return (
    <Card variant="default" className="mb-8" id="filter-section-container">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800" id="filter-section-title">Find Your Perfect Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search Input */}
          <div className="relative" id="onboarding-search-container">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconWrapper 
                  icon={FiSearch} 
                  style={{ color: '#6b7280' }} 
                />
              </div>
              <input
                id="onboarding-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
              />
            </div>
          </div>

          {/* Sort By Select */}
          <div className="relative" id="onboarding-sort-container">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconWrapper 
                  icon={FiArrowUp} 
                  style={{ color: '#6b7280' }} 
                />
              </div>
              <select
                id="onboarding-sort-select"
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

          {/* Category Select */}
          <div className="relative" id="onboarding-category-container">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconWrapper 
                  icon={FiFilter} 
                  style={{ color: '#6b7280' }} 
                />
              </div>
              <select
                id="onboarding-category-select"
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

          {/* Price Range Slider */}
          <div className="relative" id="onboarding-price-range-container">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Price Range: €{budgetRange[0]} - €{budgetRange[1]}
            </label>
            <div className="relative h-12 flex flex-col justify-center">
              <Range
                step={10}
                min={0}
                max={maxPrice}
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
                      background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${(budgetRange[0] / maxPrice) * 100}%, #3b82f6 ${(budgetRange[0] / maxPrice) * 100}%, #3b82f6 ${(budgetRange[1] / maxPrice) * 100}%, #e5e7eb ${(budgetRange[1] / maxPrice) * 100}%, #e5e7eb 100%)`,
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
                    }}
                    aria-label={index === 0 ? "Minimum price" : "Maximum price"}
                    role="slider"
                    aria-valuemin={0}
                    aria-valuemax={maxPrice}
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
                <span>€{maxPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FilterSection;