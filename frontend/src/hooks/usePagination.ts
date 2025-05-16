import { useState, useEffect, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  resetOnDependenciesChange?: boolean;
}

/**
 * Custom hook to handle pagination logic
 */
export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
  totalItems = 0,
  resetOnDependenciesChange = true,
}: UsePaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(totalItems);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset to first page when dependencies change
  useEffect(() => {
    if (resetOnDependenciesChange) {
      setCurrentPage(1);
    }
  }, [totalItems, resetOnDependenciesChange]);

  // Update total when totalItems changes
  useEffect(() => {
    setTotal(totalItems);
  }, [totalItems]);

  const goToPage = useCallback((page: number) => {
    // Ensure the page is within valid bounds
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    // Adjust current page to maintain the first item's position when changing page size
    const firstItemIndex = (currentPage - 1) * pageSize;
    const newPage = Math.floor(firstItemIndex / newSize) + 1;
    setCurrentPage(newPage);
  }, [currentPage, pageSize]);

  return {
    currentPage,
    pageSize,
    totalPages,
    total,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    setTotal,
  };
}

export default usePagination;