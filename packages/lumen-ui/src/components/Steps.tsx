import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from './classNames';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';
export type StepsDirection = 'horizontal' | 'vertical';
export type StepsSize = 'sm' | 'md';

export interface StepItem {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  status?: StepStatus;
  disabled?: boolean;
}

export interface StepsProps
  extends Omit<React.HTMLAttributes<HTMLOListElement>, 'onChange'> {
  items: StepItem[];
  current?: number;
  direction?: StepsDirection;
  size?: StepsSize;
  onChange?: (index: number, item: StepItem) => void;
}

const indicatorStatusClassNames: Record<StepStatus, string> = {
  wait: 'border-[var(--lumen-color-border-hover)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text-placeholder)]',
  process: 'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)] shadow-[0_0_0_4px_var(--lumen-color-focus-ring)]',
  finish: 'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]',
  error: 'border-[var(--lumen-color-danger)] bg-[var(--lumen-color-danger-soft)] text-[var(--lumen-color-danger)]',
};

const getStepStatus = (item: StepItem, index: number, current: number): StepStatus => {
  if (item.status) return item.status;
  if (index < current) return 'finish';
  if (index === current) return 'process';
  return 'wait';
};

export const Steps = React.forwardRef<HTMLOListElement, StepsProps>(
  (
    {
      items,
      current = 0,
      direction = 'horizontal',
      size = 'md',
      onChange,
      className,
      ...props
    },
    ref,
  ) => (
    <ol
      {...props}
      ref={ref}
      data-ui="steps"
      data-direction={direction}
      className={cn(
        direction === 'horizontal'
          ? 'flex min-w-0 flex-col gap-4 pad:flex-row pad:gap-0'
          : 'flex min-w-0 flex-col gap-4',
        className,
      )}
    >
      {items.map((item, index) => {
        const status = getStepStatus(item, index, current);
        const interactive = Boolean(onChange) && !item.disabled;
        const indicatorSize = size === 'sm' ? 'h-7 w-7 text-[12px]' : 'h-8 w-8 text-[13px]';
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'relative z-[1] flex shrink-0 items-center justify-center rounded-full border font-medium transition-colors',
                indicatorSize,
                indicatorStatusClassNames[status],
              )}
            >
              {item.icon ?? (status === 'finish'
                ? <Check size={15} strokeWidth={2.5} />
                : status === 'error'
                  ? <X size={15} strokeWidth={2.5} />
                  : index + 1)}
            </span>
            <span className="min-w-0 pt-0.5 pad:pt-1">
              <span
                className={cn(
                  'block text-[13px] font-medium leading-5',
                  status === 'process' && 'text-[var(--lumen-color-primary)]',
                  status === 'error' && 'text-[var(--lumen-color-danger-text)]',
                  (status === 'wait' || status === 'finish') && 'text-[var(--lumen-color-text-secondary)]',
                )}
              >
                {item.title}
              </span>
              {item.description ? (
                <span className="mt-0.5 block text-[12px] leading-5 text-[var(--lumen-color-text-muted)]">
                  {item.description}
                </span>
              ) : null}
            </span>
          </>
        );

        return (
          <li
            key={index}
            aria-current={status === 'process' ? 'step' : undefined}
            data-status={status}
            className={cn(
              'relative min-w-0 flex-1',
              item.disabled && 'opacity-50',
              index < items.length - 1 && direction === 'vertical'
                && 'after:absolute after:bottom-[-16px] after:left-[15px] after:top-8 after:w-px after:bg-[var(--lumen-color-border)]',
              index < items.length - 1 && direction === 'horizontal'
                && 'after:absolute after:bottom-[-16px] after:left-[15px] after:top-8 after:w-px after:bg-[var(--lumen-color-border)] pad:after:bottom-auto pad:after:left-[calc(50%+22px)] pad:after:right-[calc(-50%+22px)] pad:after:top-[15px] pad:after:h-px pad:after:w-auto',
            )}
          >
            {interactive ? (
              <button
                type="button"
                className={cn(
                  'flex w-full items-start gap-3 rounded-[8px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20',
                  direction === 'horizontal' && 'pad:flex-col pad:items-center pad:px-2 pad:text-center',
                )}
                onClick={() => onChange?.(index, item)}
              >
                {content}
              </button>
            ) : (
              <div
                className={cn(
                  'flex items-start gap-3',
                  direction === 'horizontal' && 'pad:flex-col pad:items-center pad:px-2 pad:text-center',
                )}
              >
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  ),
);

Steps.displayName = 'Steps';
