import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = React.memo(function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 bg-olive/5 border-t border-olive/10">
      <div className="flex items-center justify-between">
        <div className="text-sm text-nocciola">
          Pagina {currentPage} di {totalPages}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-olive/20 rounded hover:bg-olive hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Precedente
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-olive/20 rounded hover:bg-olive hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Successiva
          </button>
        </div>
      </div>
    </div>
  );
});

export default Pagination;