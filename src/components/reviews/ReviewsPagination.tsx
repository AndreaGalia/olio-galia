'use client';

import { useT } from '@/hooks/useT';

interface ReviewsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  translate: (key: string, params?: Record<string, string>) => string;
}

export default function ReviewsPagination({
  currentPage,
  totalPages,
  onPageChange,
  translate,
}: ReviewsPaginationProps) {
  const { t } = useT();

  return (
    <div className="border-t border-olive/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-[11px] tracking-[0.15em] uppercase text-black/40">
        {translate('productReviews.pagination.page', {
          current: currentPage.toString(),
          total: totalPages.toString(),
        })}
      </p>

      <div className="flex gap-2 w-full sm:w-auto">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex-1 sm:flex-none px-5 py-2.5 border border-olive/20 text-[11px] tracking-[0.15em] uppercase text-black/50 disabled:opacity-30 disabled:cursor-not-allowed hover:border-olive hover:text-black transition-colors cursor-pointer"
        >
          {t.productReviews.pagination.previous}
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex-1 sm:flex-none px-5 py-2.5 border border-olive/20 text-[11px] tracking-[0.15em] uppercase text-black/50 disabled:opacity-30 disabled:cursor-not-allowed hover:border-olive hover:text-black transition-colors cursor-pointer"
        >
          {t.productReviews.pagination.next}
        </button>
      </div>
    </div>
  );
}
