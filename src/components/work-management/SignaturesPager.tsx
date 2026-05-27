'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturesPagerProps {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  onChangeOffset: (offset: number) => void;
}

export function SignaturesPager({
  total,
  offset,
  limit,
  hasMore,
  onChangeOffset,
}: SignaturesPagerProps) {
  if (total <= limit) {
    return null;
  }

  const pageCount = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const startRow = total === 0 ? 0 : offset + 1;
  const endRow = Math.min(offset + limit, total);
  const prevDisabled = offset <= 0;
  const nextDisabled = !hasMore;

  return (
    <div className="px-6 py-4 border-t border-sage/20 flex items-center justify-between gap-4 flex-wrap text-sm">
      <span className="text-forest/60">
        Showing {startRow}–{endRow} of {total}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChangeOffset(Math.max(0, offset - limit))}
          disabled={prevDisabled}
          aria-label="Previous page"
          className={cn(
            'p-1.5 rounded-full transition-colors',
            prevDisabled
              ? 'text-forest/20 cursor-not-allowed'
              : 'text-forest/60 hover:bg-sage/10 hover:text-forest',
          )}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
        </button>
        <span className="font-display text-xs uppercase tracking-wider text-forest/50">
          Page {currentPage} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onChangeOffset(offset + limit)}
          disabled={nextDisabled}
          aria-label="Next page"
          className={cn(
            'p-1.5 rounded-full transition-colors',
            nextDisabled
              ? 'text-forest/20 cursor-not-allowed'
              : 'text-forest/60 hover:bg-sage/10 hover:text-forest',
          )}
        >
          <ArrowRight className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export default SignaturesPager;
