import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from './classNames';
import { Select } from './Select';

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

export type PaginationVariant = 'default' | 'compact';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  variant?: PaginationVariant;
  loading?: boolean;
  itemLabel?: string;
  hideOnSinglePage?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

const buildPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push('ellipsis-left');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push('ellipsis-right');
  }

  items.push(totalPages);
  return items;
};

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  variant = 'default',
  loading = false,
  itemLabel = '条',
  hideOnSinglePage,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageSizeChange,
  className = '',
}: PaginationProps) => {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const normalizedPageSizeOptions = useMemo(
    () =>
      Array.from(new Set((pageSizeOptions ?? []).filter((option) => option > 0))).sort(
        (left, right) => left - right,
      ),
    [pageSizeOptions],
  );
  const shouldShowPageSizeSelector =
    typeof pageSize === 'number'
    && typeof onPageSizeChange === 'function'
    && normalizedPageSizeOptions.length > 0;

  const paginationItems = useMemo(
    () => buildPaginationItems(safeCurrentPage, safeTotalPages),
    [safeCurrentPage, safeTotalPages],
  );
  const shouldHideOnSinglePage =
    hideOnSinglePage ?? variant === 'compact';

  if (shouldHideOnSinglePage && totalPages <= 1) return null;

  if (variant === 'compact') {
    return (
      <div
        data-ui="pagination"
        data-variant="compact"
        className={cn(
          'flex shrink-0 flex-row items-center justify-between gap-1.5 border-t border-[var(--lumen-color-border)] px-3 py-1.5 text-xs text-[var(--lumen-color-text-muted)]',
          className,
        )}
      >
        <span className="min-w-0">
          共 {totalItems} {itemLabel} · 第 {safeCurrentPage} / {safeTotalPages} 页
        </span>
        <div className="flex shrink-0 gap-1.5">
          <Button
            disabled={safeCurrentPage <= 1 || loading}
            onClick={() => onPageChange(safeCurrentPage - 1)}
            size="sm"
            type="button"
            variant="secondary"
          >
            上一页
          </Button>
          <Button
            disabled={safeCurrentPage >= safeTotalPages || loading}
            onClick={() => onPageChange(safeCurrentPage + 1)}
            size="sm"
            type="button"
            variant="secondary"
          >
            下一页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-ui="pagination"
      data-variant="default"
      className={cn(
        'flex flex-col gap-2 border-t border-[var(--lumen-color-surface-muted)] bg-[var(--lumen-color-surface-subtle)] px-3 py-2.5 pad:px-4 l:flex-row l:items-center l:justify-between',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-[var(--lumen-color-text-muted)]">共 {totalItems} 条</span>
        <span className="text-[13px] text-[var(--lumen-color-text-muted)]">
          第 {safeCurrentPage} / {safeTotalPages} 页
        </span>
        {shouldShowPageSizeSelector ? (
          <div className="w-[104px]">
              <Select<number>
                options={normalizedPageSizeOptions.map((option) => ({
                  label: `${option}条/页`,
                  value: option,
                }))}
                value={pageSize}
                onChange={(value) => onPageSizeChange(Number(value))}
                disabled={loading}
                size="sm"
                className="w-full"
                radius="rounded-[8px]"
              />
          </div>
        ) : null}
      </div>
      <div className="flex max-w-full flex-wrap items-center gap-0.5 overflow-x-auto">
        <button
          type="button"
          aria-label="上一页"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1 || loading}
          className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        {paginationItems.map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={loading}
              aria-current={item === safeCurrentPage ? 'page' : undefined}
              className={cn(
                'h-[28px] w-[28px] rounded-[6px] text-[12px] transition-colors',
                item === safeCurrentPage
                  ? 'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)]'
                  : 'text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-primary-soft)]',
              )}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              className="flex h-[28px] w-[28px] items-center justify-center text-[12px] text-[var(--lumen-color-text-placeholder)]"
            >
              ...
            </span>
          ),
        )}
        <button
          type="button"
          aria-label="下一页"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages || loading}
          className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
