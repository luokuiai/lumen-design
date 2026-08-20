import React from 'react';
import { Button } from './Button';
import { cn } from './classNames';

interface CompactPaginationProps {
  className?: string;
  currentPage: number;
  itemLabel?: string;
  loading?: boolean;
  onPageChange: (page: number) => void;
  totalItems: number;
  totalPages: number;
}

export const CompactPagination: React.FC<CompactPaginationProps> = ({
  className,
  currentPage,
  itemLabel = '条',
  loading = false,
  onPageChange,
  totalItems,
  totalPages,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-between border-t border-[var(--lumen-color-border)] px-3 py-1.5 text-xs text-[var(--lumen-color-text-muted)]',
        className,
      )}
    >
      <span>
        共 {totalItems} {itemLabel} · 第 {currentPage} / {totalPages} 页
      </span>
      <div className="flex gap-2">
        <Button
          disabled={currentPage <= 1 || loading}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          size="sm"
          type="button"
          variant="secondary"
        >
          上一页
        </Button>
        <Button
          disabled={currentPage >= totalPages || loading}
          onClick={() => onPageChange(currentPage + 1)}
          size="sm"
          type="button"
          variant="secondary"
        >
          下一页
        </Button>
      </div>
    </div>
  );
};
