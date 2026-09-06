import { ChevronRight } from 'lucide-react';
import React from 'react';
import { cn } from '../classNames';
import { useLumenLocale } from '../../i18n';

export type BreadcrumbSize = 'sm' | 'md' | 'lg';

export interface BreadcrumbItem {
  key?: React.Key;
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  size?: BreadcrumbSize;
}

const sizeClassNames: Record<BreadcrumbSize, string> = {
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[15px]',
};

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator = <ChevronRight aria-hidden="true" size={14} strokeWidth={1.75} />,
      size = 'md',
      className,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const locale = useLumenLocale();
    return (
    <nav
      {...props}
      ref={ref}
      aria-label={ariaLabel ?? locale.navigation.breadcrumb}
      data-ui="breadcrumb"
      data-size={size}
      className={cn('max-w-full overflow-x-auto', sizeClassNames[size], className)}
    >
      <ol className="flex min-w-max items-center gap-1.5 whitespace-nowrap">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          const content = (
            <>
              {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
              <span>{item.label}</span>
            </>
          );
          const itemClassName = cn(
            'inline-flex items-center gap-1 rounded-[var(--lumen-radius-tag)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20',
            current
              ? 'text-[var(--lumen-color-text)]'
              : 'text-[var(--lumen-color-text-placeholder)]',
            !current && !item.disabled && 'hover:text-[var(--lumen-color-primary)]',
            item.disabled && 'cursor-not-allowed opacity-50',
          );

          let itemContent: React.ReactNode;
          if (item.disabled) {
            itemContent = (
              <span aria-disabled="true" className={itemClassName}>
                {content}
              </span>
            );
          } else if (item.href) {
            itemContent = (
              <a
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={itemClassName}
                onClick={item.onClick}
              >
                {content}
              </a>
            );
          } else if (item.onClick && !current) {
            itemContent = (
              <button type="button" className={itemClassName} onClick={item.onClick}>
                {content}
              </button>
            );
          } else {
            itemContent = (
              <span aria-current={current ? 'page' : undefined} className={itemClassName}>
                {content}
              </span>
            );
          }

          return (
            <li key={item.key ?? index} className="flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-[var(--lumen-color-text-placeholder)]">
                  {separator}
                </span>
              ) : null}
              {itemContent}
            </li>
          );
        })}
      </ol>
    </nav>
    );
  },
);

Breadcrumb.displayName = 'Breadcrumb';
