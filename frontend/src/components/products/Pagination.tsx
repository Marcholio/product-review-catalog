import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Previous page"
      >
        <FiChevronLeft size={20} />
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
              onClick={() => onPageChange(pageNumber)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                ${isCurrentPage 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              aria-label={`Page ${pageNumber}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Next page"
      >
        <FiChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;