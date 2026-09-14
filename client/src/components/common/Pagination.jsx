// client/src/components/common/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = ''
}) {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 rounded-b-xl ${className}`}>
      <div className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{totalItems > 0 ? start : 0}</span> to{' '}
        <span className="font-medium text-slate-700">{end}</span> of{' '}
        <span className="font-medium text-slate-700">{totalItems}</span> results
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="xs"
          colorScheme="gray"
          isDisabled={currentPage <= 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>
        <span className="text-xs font-semibold px-2 text-slate-600">
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="xs"
          colorScheme="gray"
          isDisabled={currentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
