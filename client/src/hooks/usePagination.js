// client/src/hooks/usePagination.js
import { useState } from 'react';

export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const nextPage = () => setCurrentPage((p) => p + 1);
  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToPage = (page) => setCurrentPage(Math.max(1, page));

  return {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    goToPage
  };
}
