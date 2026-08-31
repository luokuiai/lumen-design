import React from 'react';
import { cn } from './classNames';

export type ListDensity = 'default' | 'compact';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  density?: ListDensity;
  bordered?: boolean;
  divided?: boolean;
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(
  (
    {
      density = 'default',
      bordered = true,
      divided = true,
      className,
      ...props
    },
    ref,
  ) => (
    <ul
      {...props}
      ref={ref}
      data-ui="list"
      data-density={density}
      className={cn(
        'min-w-0 overflow-hidden bg-[var(--lumen-color-surface)]',
        bordered && 'rounded-[8px] border border-[var(--lumen-color-border)]',
        divided && '[&>li+li]:border-t [&>li+li]:border-[var(--lumen-color-surface-muted)]',
        density === 'compact' && '[&>li>button]:px-3 [&>li>button]:py-2 [&>li>div:first-child]:px-3 [&>li>div:first-child]:py-2',
        className,
      )}
    />
  ),
);

List.displayName = 'List';

export interface ListItemProps
  extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  leading?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  selectLabel?: string;
}

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  (
    {
      title,
      description,
      leading,
      meta,
      actions,
      selected = false,
      disabled = false,
      onSelect,
      selectLabel,
      className,
      ...props
    },
    ref,
  ) => {
    const interactive = Boolean(onSelect);
    const content = (
      <>
        {leading ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-muted)]">
            {leading}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-col gap-1 pad:flex-row pad:items-start pad:justify-between pad:gap-4">
            <span className="min-w-0 text-[13px] font-normal leading-5 text-[var(--lumen-color-text)]">
              {title}
            </span>
            {meta ? <span className="shrink-0 text-[12px] leading-5 text-[var(--lumen-color-text-muted)]">{meta}</span> : null}
          </span>
          {description ? (
            <span className="mt-0.5 block text-[13px] font-normal leading-5 text-[var(--lumen-color-text-muted)]">
              {description}
            </span>
          ) : null}
        </span>
      </>
    );

    return (
      <li
        {...props}
        ref={ref}
        data-ui="list-item"
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          'flex min-w-0 items-center transition-colors data-[selected=true]:bg-[var(--lumen-color-info-soft)] data-[disabled=true]:opacity-50',
          !disabled && 'hover:bg-[var(--lumen-color-surface-hover)]',
          className,
        )}
      >
        {interactive ? (
          <button
            type="button"
            aria-label={selectLabel}
            aria-pressed={selected}
            disabled={disabled}
            className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--lumen-color-primary)]/20"
            onClick={onSelect}
          >
            {content}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3">{content}</div>
        )}
        {actions ? <div className="shrink-0 pr-3">{actions}</div> : null}
      </li>
    );
  },
);

ListItem.displayName = 'ListItem';
