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
  wait: 'border border-[color:var(--lumen-color-border-hover)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text-placeholder)]',
  process: 'border border-[color:var(--lumen-color-primary)] bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)]',
  finish: 'border border-[color:var(--lumen-color-primary)] bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]',
  error: 'border border-[color:var(--lumen-color-danger)] bg-[var(--lumen-color-danger-soft)] text-[var(--lumen-color-danger)]',
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
          ? 'flex min-w-0 flex-row gap-0 overflow-x-auto'
          : 'flex min-w-0 flex-col gap-4',
        className,
      )}
    >
      {items.map((item, index) => {
        const status = getStepStatus(item, index, current);
        const nextItem = items[index + 1];
        const nextStatus = nextItem
          ? getStepStatus(nextItem, index + 1, current)
          : undefined;
        const interactive = Boolean(onChange) && !item.disabled;
        const indicatorFrameSize = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
        const indicatorSize = size === 'sm' ? 'h-7 w-7 text-[12px]' : 'h-8 w-8 text-[13px]';
        const horizontalConnectorStart = size === 'sm'
          ? status === 'process'
            ? 'after:left-[calc(50%+22px)]'
            : 'after:left-[calc(50%+18px)]'
          : status === 'process'
            ? 'after:left-[calc(50%+24px)]'
            : 'after:left-[calc(50%+20px)]';
        const horizontalConnectorEnd = size === 'sm'
          ? nextStatus === 'process'
            ? 'after:right-[calc(-50%+22px)]'
            : 'after:right-[calc(-50%+18px)]'
          : nextStatus === 'process'
            ? 'after:right-[calc(-50%+24px)]'
            : 'after:right-[calc(-50%+20px)]';
        const horizontalConnectorAxis = size === 'sm'
          ? 'after:top-[17px]'
          : 'after:top-[19px]';
        const verticalConnectorStart = size === 'sm'
          ? status === 'process' ? 'after:top-10' : 'after:top-9'
          : status === 'process' ? 'after:top-11' : 'after:top-10';
        const verticalConnectorEnd = nextStatus === 'process'
          ? 'after:bottom-[-12px]'
          : 'after:bottom-[-16px]';
        const verticalConnectorAxis = size === 'sm'
          ? 'after:left-[17px]'
          : 'after:left-[19px]';
        const indicatorContent = item.icon ?? (status === 'finish'
          ? <Check size={15} strokeWidth={2.5} />
          : status === 'error'
            ? <X size={15} strokeWidth={2.5} />
            : index + 1);
        const content = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                'relative z-[1] flex shrink-0 items-center justify-center rounded-full',
                indicatorFrameSize,
                status === 'process' && 'bg-[var(--lumen-color-primary-soft-hover)]',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-full font-medium transition-colors',
                  indicatorSize,
                  indicatorStatusClassNames[status],
                )}
              >
                {indicatorContent}
              </span>
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
              'relative flex-1',
              direction === 'horizontal' ? 'min-w-[120px]' : 'min-w-0',
              item.disabled && 'opacity-50',
              index < items.length - 1 && direction === 'vertical'
                && cn(
                  'after:absolute after:w-px after:bg-[var(--lumen-color-border)]',
                  verticalConnectorAxis,
                  verticalConnectorStart,
                  verticalConnectorEnd,
                ),
              index < items.length - 1 && direction === 'horizontal'
                && cn(
                  'after:absolute after:h-px after:bg-[var(--lumen-color-border)]',
                  horizontalConnectorAxis,
                  horizontalConnectorStart,
                  horizontalConnectorEnd,
                ),
            )}
          >
            {interactive ? (
              <button
                type="button"
                className={cn(
                  'flex w-full gap-3 rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20',
                  direction === 'horizontal'
                    ? 'flex-col items-center px-2 text-center'
                    : 'items-start text-left',
                )}
                onClick={() => onChange?.(index, item)}
              >
                {content}
              </button>
            ) : (
              <div
                className={cn(
                  'flex gap-3',
                  direction === 'horizontal'
                    ? 'flex-col items-center px-2 text-center'
                    : 'items-start text-left',
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
