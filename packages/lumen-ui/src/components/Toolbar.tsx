import React from 'react';
import { cn } from './classNames';

export type ToolbarSize = 'sm' | 'md' | 'lg';

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ToolbarSize;
  wrap?: boolean;
  ariaLabel?: string;
}

const toolbarSizeClassNames: Record<ToolbarSize, string> = {
  sm: 'min-h-10 px-2',
  md: 'min-h-12 px-2.5',
  lg: 'min-h-14 px-3',
};

const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (
    {
      size = 'md',
      wrap = false,
      ariaLabel = '工具栏',
      className,
      children,
      onKeyDown,
      role = 'toolbar',
      ...props
    },
    ref,
  ) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

      const target = event.target as HTMLElement;
      if (target.matches('input, select, textarea')) return;

      const controls = Array.from(
        event.currentTarget.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((control) => !control.hasAttribute('disabled'));
      if (controls.length === 0) return;

      const currentIndex = controls.findIndex(
        (control) => control === target || control.contains(target),
      );
      const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
      let nextIndex: number;

      if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = controls.length - 1;
      } else if (event.key === forwardKey) {
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % controls.length;
      } else {
        nextIndex = currentIndex <= 0 ? controls.length - 1 : currentIndex - 1;
      }

      event.preventDefault();
      controls[nextIndex]?.focus();
    };

    return (
      <div
        {...props}
        ref={ref}
        role={role}
        aria-label={ariaLabel}
        aria-orientation={role === 'toolbar' ? 'horizontal' : undefined}
        data-size={size}
        data-ui="toolbar"
        className={cn(
          'flex min-w-0 items-center gap-2',
          toolbarSizeClassNames[size],
          wrap ? 'flex-wrap' : 'overflow-x-auto overflow-y-hidden',
          className,
        )}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    );
  },
);

Toolbar.displayName = 'Toolbar';
