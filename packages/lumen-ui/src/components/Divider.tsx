import React from 'react';
import { cn } from './classNames';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerAlign = 'start' | 'center' | 'end';
export type DividerVariant = 'solid' | 'dashed';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  align?: DividerAlign;
  variant?: DividerVariant;
  label?: React.ReactNode;
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      align = 'center',
      variant = 'solid',
      label,
      className,
      role,
      ...props
    },
    ref,
  ) => {
    const lineClassName = variant === 'dashed'
      ? 'border-dashed'
      : 'border-solid';

    if (orientation === 'vertical') {
      return (
        <div
          {...props}
          ref={ref}
          role={role ?? 'separator'}
          aria-orientation="vertical"
          data-ui="divider"
          className={cn(
            'mx-2 inline-block min-h-4 self-stretch border-l border-[var(--lumen-color-border)] align-middle',
            lineClassName,
            className,
          )}
        />
      );
    }

    if (!label) {
      return (
        <div
          {...props}
          ref={ref}
          role={role ?? 'separator'}
          aria-orientation="horizontal"
          data-ui="divider"
          className={cn(
            'my-4 w-full border-t border-[var(--lumen-color-border)]',
            lineClassName,
            className,
          )}
        />
      );
    }

    return (
      <div
        {...props}
        ref={ref}
        role={role ?? 'separator'}
        aria-orientation="horizontal"
        data-ui="divider"
        className={cn('my-4 flex w-full items-center gap-3', className)}
      >
        {align !== 'start' ? (
          <span
            className={cn(
              'border-t border-[var(--lumen-color-border)]',
              lineClassName,
              'flex-1',
            )}
          />
        ) : null}
        <span className="shrink-0 text-[12px] font-medium text-[var(--lumen-color-text-muted)]">
          {label}
        </span>
        {align !== 'end' ? (
          <span
            className={cn(
              'border-t border-[var(--lumen-color-border)]',
              lineClassName,
              align === 'center' ? 'flex-1' : 'flex-1',
            )}
          />
        ) : null}
      </div>
    );
  },
);

Divider.displayName = 'Divider';
