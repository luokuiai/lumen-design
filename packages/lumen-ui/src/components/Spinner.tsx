import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from './classNames';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  label?: React.ReactNode;
}

const spinnerSizeTokens: Record<SpinnerSize, { icon: number; text: string }> = {
  sm: { icon: 16, text: 'text-[12px]' },
  md: { icon: 20, text: 'text-[13px]' },
  lg: { icon: 28, text: 'text-[14px]' },
};

const spinnerToneClassNames: Record<SpinnerTone, string> = {
  neutral: 'text-[var(--lumen-color-text-muted)]',
  info: 'text-[var(--lumen-color-primary)]',
  success: 'text-[var(--lumen-color-success)]',
  warning: 'text-[var(--lumen-color-warning)]',
  danger: 'text-[var(--lumen-color-danger)]',
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', tone = 'info', label, className, role, ...props }, ref) => {
    const sizeToken = spinnerSizeTokens[size];
    return (
      <div
        {...props}
        ref={ref}
        role={role ?? 'status'}
        data-ui="spinner"
        data-size={size}
        className={cn(
          'inline-flex items-center gap-2',
          spinnerToneClassNames[tone],
          className,
        )}
      >
        <LoaderCircle
          aria-hidden="true"
          className="shrink-0 animate-spin"
          size={sizeToken.icon}
        />
        {label ? (
          <span className={cn('text-[var(--lumen-color-text-secondary)]', sizeToken.text)}>
            {label}
          </span>
        ) : (
          <span className="sr-only">加载中</span>
        )}
      </div>
    );
  },
);

Spinner.displayName = 'Spinner';
