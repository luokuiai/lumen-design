import React from 'react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';

export type SegmentedControlSize = 'sm' | 'md';

export interface SegmentedControlOption<T extends string> {
  label: React.ReactNode;
  value: T;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: T;
  options: Array<SegmentedControlOption<T>>;
  onChange: (value: T) => void;
  size?: SegmentedControlSize;
  fullWidth?: boolean;
}

const itemSizeClasses: Record<SegmentedControlSize, string> = {
  sm: 'h-7 px-3 text-[12px]',
  md: 'h-8 px-3.5 text-[13px]',
};

export const SegmentedControl = <T extends string>({
  value,
  options,
  onChange,
  size = 'sm',
  fullWidth = false,
  className,
  role = 'group',
  ...props
}: SegmentedControlProps<T>) => (
  <div
    role={role}
    className={cn(
      'inline-flex max-w-full gap-1 border border-[var(--lumen-color-border)]/80 bg-[var(--lumen-color-surface-glass)] p-1 backdrop-blur-[5px]',
      radiusTokens.control,
      fullWidth && 'flex w-full',
      className,
    )}
    {...props}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={active}
          disabled={option.disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-[5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-45',
            itemSizeClasses[size],
            fullWidth && 'flex-1',
            active
              ? 'bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)]'
              : 'text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text)]',
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
