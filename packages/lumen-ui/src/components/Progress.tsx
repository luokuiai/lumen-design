import React from 'react';
import { cn } from './classNames';
import { useLumenLocale } from '../i18n';

export type ProgressType = 'line' | 'circle';
export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressStatus = 'info' | 'success' | 'warning' | 'danger';

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number;
  max?: number;
  type?: ProgressType;
  size?: ProgressSize;
  status?: ProgressStatus;
  label?: React.ReactNode;
  showValue?: boolean;
  indeterminate?: boolean;
  formatValue?: (percentage: number, value: number, max: number) => React.ReactNode;
}

const progressColorVariables: Record<ProgressStatus, string> = {
  info: 'var(--lumen-color-primary)',
  success: 'var(--lumen-color-success)',
  warning: 'var(--lumen-color-warning)',
  danger: 'var(--lumen-color-danger)',
};

const lineHeightClassNames: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

const circleSizeTokens: Record<ProgressSize, { size: number; inset: number }> = {
  sm: { size: 48, inset: 4 },
  md: { size: 64, inset: 5 },
  lg: { size: 80, inset: 6 },
};

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      max = 100,
      type = 'line',
      size = 'md',
      status = 'info',
      label,
      showValue = false,
      indeterminate = false,
      formatValue,
      className,
      ...props
    },
    ref,
  ) => {
    const locale = useLumenLocale();
    const safeMax = max > 0 ? max : 100;
    const safeValue = Math.min(safeMax, Math.max(0, value));
    const percentage = Math.round((safeValue / safeMax) * 100);
    const valueLabel = formatValue?.(percentage, safeValue, safeMax) ?? `${percentage}%`;
    const color = progressColorVariables[status];
    const ariaProps = indeterminate
      ? { 'aria-valuetext': locale.accessibility.loading }
      : { 'aria-valuemin': 0, 'aria-valuemax': safeMax, 'aria-valuenow': safeValue };

    if (type === 'circle') {
      const circle = circleSizeTokens[size];
      return (
        <div
          {...props}
          {...ariaProps}
          ref={ref}
          role="progressbar"
          data-ui="progress"
          data-type="circle"
          data-status={status}
          className={cn('inline-flex flex-col items-center gap-2', className)}
        >
          <div
            className={cn('relative rounded-full', indeterminate && 'animate-spin')}
            style={{
              width: circle.size,
              height: circle.size,
              background: indeterminate
                ? `conic-gradient(transparent 0 25%, ${color} 85% 100%)`
                : `conic-gradient(${color} ${percentage}%, var(--lumen-color-surface-muted) 0)`,
            }}
          >
            <span
              className="absolute flex items-center justify-center rounded-full bg-[var(--lumen-color-surface)] text-[12px] font-medium text-[var(--lumen-color-text-secondary)]"
              style={{ inset: circle.inset }}
            >
              {!indeterminate && showValue ? valueLabel : null}
            </span>
          </div>
          {label ? <span className="text-[13px] text-[var(--lumen-color-text-secondary)]">{label}</span> : null}
        </div>
      );
    }

    return (
      <div
        {...props}
        {...ariaProps}
        ref={ref}
        role="progressbar"
        data-ui="progress"
        data-type="line"
        data-status={status}
        className={cn('min-w-0', className)}
      >
        {label || showValue ? (
          <div className="mb-2 flex items-center justify-between gap-3 text-[13px] leading-5">
            <span className="min-w-0 text-[var(--lumen-color-text-secondary)]">{label}</span>
            {showValue && !indeterminate ? (
              <span className="shrink-0 font-medium text-[var(--lumen-color-text)]">{valueLabel}</span>
            ) : null}
          </div>
        ) : null}
        <div
          className={cn(
            'w-full overflow-hidden rounded-full bg-[var(--lumen-color-surface-muted)]',
            lineHeightClassNames[size],
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-300 ease-out',
              indeterminate && 'w-2/5 animate-pulse',
            )}
            style={{
              width: indeterminate ? undefined : `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    );
  },
);

Progress.displayName = 'Progress';
