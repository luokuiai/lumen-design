import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description?: string;
  meta?: { label: string; value: string }[];
  type?: 'default' | 'success' | 'warning' | 'error';
  beforeValue?: string;
  afterValue?: string;
}

type TimelineType = NonNullable<TimelineItem['type']>;

interface TimelineProps {
  items: TimelineItem[];
  onItemClick?: (id: string) => void;
  emptyText?: string;
  maxItems?: number;
}

const typeStyles: Record<TimelineType, { dot: string; line: string; badge: string }> = {
  success: {
    dot: 'border-[var(--lumen-color-success)] bg-[var(--lumen-color-surface)]',
    line: 'bg-[var(--lumen-color-success)]',
    badge: 'bg-[var(--lumen-color-success-soft)] text-[var(--lumen-color-success-text)]',
  },
  warning: {
    dot: 'border-[var(--lumen-color-warning)] bg-[var(--lumen-color-surface)]',
    line: 'bg-[var(--lumen-color-warning)]',
    badge: 'bg-[var(--lumen-color-warning-soft)] text-[var(--lumen-color-warning-text)]',
  },
  error: {
    dot: 'border-[var(--lumen-color-danger)] bg-[var(--lumen-color-surface)]',
    line: 'bg-[var(--lumen-color-danger)]',
    badge: 'bg-[var(--lumen-color-danger-soft)] text-[var(--lumen-color-danger-text)]',
  },
  default: {
    dot: 'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-surface)]',
    line: 'bg-[var(--lumen-color-primary)]',
    badge: 'bg-[var(--lumen-color-info-soft)] text-[var(--lumen-color-info-text)]',
  },
};

export const Timeline: React.FC<TimelineProps> = ({
  items,
  onItemClick,
  emptyText = '暂无记录',
  maxItems,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-[var(--lumen-color-surface-muted)] p-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--lumen-color-text-placeholder)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </div>
        <p className="mt-3 text-[13px] text-[var(--lumen-color-text-placeholder)]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {displayItems.map((item, idx) => {
        const style = typeStyles[item.type || 'default'];
        const isExpanded = expandedItems.has(item.id);
        const hasDetails = item.beforeValue || item.afterValue || item.description;

        return (
          <div
            key={item.id}
            data-timeline-item
            className={`relative flex gap-3 pb-4 pad:gap-4 ${idx === displayItems.length - 1 ? '' : ''}`}
          >
            {idx < displayItems.length - 1 && (
              <div
                data-timeline-connector
                className={`absolute left-[6px] top-[22px] bottom-0 w-[2px] rounded-full opacity-[0.45] ${style.line}`}
              />
            )}
            <div className="relative flex flex-col items-center">
              <div className={`relative z-10 mt-1 h-[14px] w-[14px] rounded-full border-2 ${style.dot} shrink-0`} />
            </div>

            <div
              className={`min-w-0 flex-1 rounded-[12px] border border-[var(--lumen-color-surface-muted)] bg-[var(--lumen-color-surface)] p-3 transition-shadow hover:shadow-sm pad:p-4 ${
                onItemClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onItemClick?.(item.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                      {item.title}
                    </span>
                    {hasDetails && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleExpand(item.id);
                        }}
                        className="inline-flex items-center gap-0.5 text-[11px] text-[var(--lumen-color-text-placeholder)] hover:text-[var(--lumen-color-text-muted)]"
                      >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        详情
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--lumen-color-text-muted)]">{item.date}</p>
                </div>
              </div>

              {item.meta && item.meta.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3 border-t border-[var(--lumen-color-surface-muted)] pt-3">
                  {item.meta.map((metaItem) => (
                    <div key={metaItem.label}>
                      <span className="text-[11px] text-[var(--lumen-color-text-placeholder)]">{metaItem.label}</span>
                      <span className="ml-1.5 text-[12px] font-medium text-[var(--lumen-color-text-secondary)]">{metaItem.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {isExpanded && hasDetails && (
                <div className="mt-3 space-y-2 border-t border-[var(--lumen-color-surface-muted)] pt-3">
                  {item.description && (
                    <p className="text-[12px] leading-6 text-[var(--lumen-color-text-muted)]">{item.description}</p>
                  )}
                  {item.beforeValue && item.afterValue && (
                    <div className="grid grid-cols-1 gap-2 pad:grid-cols-2 pad:gap-3">
                      <div className="rounded-[6px] bg-[var(--lumen-color-danger-soft)] px-3 py-2">
                        <div className="text-[10px] text-[var(--lumen-color-danger)]">变更前</div>
                        <div className="mt-0.5 text-[12px] text-[var(--lumen-color-danger-text)] line-through">{item.beforeValue}</div>
                      </div>
                      <div className="rounded-[6px] bg-[var(--lumen-color-success-soft)] px-3 py-2">
                        <div className="text-[10px] text-[var(--lumen-color-success)]">变更后</div>
                        <div className="mt-0.5 text-[12px] text-[var(--lumen-color-success-text)]">{item.afterValue}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {maxItems && items.length > maxItems && (
        <p className="pl-[30px] text-[12px] text-[var(--lumen-color-text-placeholder)]">
          还有 {items.length - maxItems} 条记录
        </p>
      )}
    </div>
  );
};
