import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from './classNames';

export type BottomNavigationPosition = 'fixed' | 'absolute' | 'static';

export interface BottomNavigationItem<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  href?: string;
  badge?: number | string;
  badgeLabel?: string;
  disabled?: boolean;
}

export interface BottomNavigationProps<T extends string = string>
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  items: readonly BottomNavigationItem<T>[];
  value?: T;
  onChange?: (value: T, item: BottomNavigationItem<T>) => void;
  active?: boolean;
  position?: BottomNavigationPosition;
  safeArea?: boolean;
  ariaLabel?: string;
  itemClassName?: string;
}

const positionClassNames: Record<BottomNavigationPosition, string> = {
  fixed: 'fixed inset-x-0 bottom-0 z-50',
  absolute: 'absolute inset-x-0 bottom-0 z-10',
  static: 'relative w-full',
};

export const BottomNavigation = <T extends string = string>({
  items,
  value,
  onChange,
  active = true,
  position = 'fixed',
  safeArea = true,
  ariaLabel = '底部导航',
  className,
  itemClassName,
  ...props
}: BottomNavigationProps<T>) => (
  <nav
    {...props}
    aria-label={ariaLabel}
    data-active={active}
    data-position={position}
    data-ui="bottom-navigation"
    hidden={!active}
    className={cn(
      'border-t border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[var(--lumen-shadow-card)]',
      positionClassNames[position],
      safeArea && 'pb-[env(safe-area-inset-bottom)]',
      className,
    )}
  >
    <div className="mx-auto flex min-h-16 w-full items-stretch">
      {items.map((item) => {
        const selected = item.value === value;
        const Icon = item.icon;
        const itemClasses = cn(
          'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-[11px] font-normal leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--lumen-color-primary)]/25',
          selected
            ? 'text-[var(--lumen-color-primary)]'
            : 'text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-surface-hover)] hover:text-[var(--lumen-color-text)]',
          item.disabled
            ? 'cursor-not-allowed opacity-45'
            : 'cursor-pointer',
          itemClassName,
        );
        const content = (
          <>
            {Icon ? (
              <span className="relative flex h-6 items-center justify-center" aria-hidden="true">
                <Icon className="shrink-0" size={21} strokeWidth={2} />
                {item.badge !== undefined ? (
                  <span
                    className="absolute -right-3 -top-1 min-w-4 rounded-full bg-[var(--lumen-color-danger-soft)] px-1 py-0.5 text-[9px] leading-none text-[var(--lumen-color-danger-text)]"
                  >
                    {item.badge}
                  </span>
                ) : null}
              </span>
            ) : null}
            <span className="block w-full truncate">{item.label}</span>
            {item.badge !== undefined ? (
              <span className="sr-only">{item.badgeLabel ?? item.badge}</span>
            ) : null}
          </>
        );
        const handleSelect = () => {
          if (!item.disabled) onChange?.(item.value, item);
        };

        return item.href && !item.disabled ? (
          <a
            key={item.value}
            href={item.href}
            aria-current={selected ? 'page' : undefined}
            className={itemClasses}
            onClick={handleSelect}
          >
            {content}
          </a>
        ) : (
          <button
            key={item.value}
            type="button"
            aria-current={selected ? 'page' : undefined}
            disabled={item.disabled}
            className={itemClasses}
            onClick={handleSelect}
          >
            {content}
          </button>
        );
      })}
    </div>
  </nav>
);
