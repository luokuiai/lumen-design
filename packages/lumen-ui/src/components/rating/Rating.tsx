import { Star } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../classNames';
import { useLumenLocale } from '../../i18n';

export type RatingSize = 'sm' | 'md' | 'lg';

export interface RatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  max?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  size?: RatingSize;
  color?: string;
  formatValue?: (value: number, max: number) => string;
}

const sizeTokens: Record<RatingSize, { icon: number; gap: string }> = {
  sm: { icon: 16, gap: 'gap-0.5' },
  md: { icon: 20, gap: 'gap-1' },
  lg: { icon: 24, gap: 'gap-1.5' },
};

const normalizeValue = (value: number, max: number, step: number) =>
  Math.min(max, Math.max(0, Math.round(value / step) * step));

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      onChange,
      max = 5,
      allowHalf = false,
      allowClear = true,
      readOnly = false,
      disabled = false,
      size = 'md',
      color,
      formatValue = (current, total) => `${current} / ${total}`,
      className,
      onKeyDown,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const locale = useLumenLocale();
    const resolvedMax = Math.max(1, Math.floor(max));
    const step = allowHalf ? 0.5 : 1;
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(
      normalizeValue(defaultValue, resolvedMax, step),
    );
    const [previewValue, setPreviewValue] = useState<number | null>(null);
    const currentValue = normalizeValue(controlled ? value : internalValue, resolvedMax, step);
    const displayedValue = previewValue ?? currentValue;
    const sizeToken = sizeTokens[size];

    const commitValue = (nextValue: number) => {
      if (disabled || readOnly) return;
      const normalized = normalizeValue(nextValue, resolvedMax, step);
      const resolved = allowClear && normalized === currentValue ? 0 : normalized;
      if (!controlled) setInternalValue(resolved);
      onChange?.(resolved);
    };

    const getPointerValue = (
      event: { currentTarget: HTMLSpanElement; clientX: number },
      index: number,
    ) => {
      if (!allowHalf) return index;
      const rect = event.currentTarget.getBoundingClientRect();
      return event.clientX < rect.left + rect.width / 2 ? index - 0.5 : index;
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
      let nextValue: number | undefined;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        nextValue = Math.min(resolvedMax, currentValue + step);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        nextValue = Math.max(0, currentValue - step);
      } else if (event.key === 'Home') {
        nextValue = 0;
      } else if (event.key === 'End') {
        nextValue = resolvedMax;
      }

      if (nextValue !== undefined && !disabled && !readOnly) {
        event.preventDefault();
        const normalized = normalizeValue(nextValue, resolvedMax, step);
        if (!controlled) setInternalValue(normalized);
        onChange?.(normalized);
      }
      onKeyDown?.(event);
    };

    return (
      <div
        {...props}
        ref={ref}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel ?? locale.accessibility.rating}
        aria-valuemin={0}
        aria-valuemax={resolvedMax}
        aria-valuenow={currentValue}
        aria-valuetext={formatValue(currentValue, resolvedMax)}
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        data-ui="rating"
        data-size={size}
        className={cn(
          'inline-flex w-fit items-center rounded-[var(--lumen-radius-control)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20',
          sizeToken.gap,
          disabled && 'cursor-not-allowed opacity-45',
          readOnly && 'cursor-default',
          !disabled && !readOnly && 'cursor-pointer',
          className,
        )}
        onKeyDown={handleKeyDown}
        onPointerLeave={() => setPreviewValue(null)}
      >
        {Array.from({ length: resolvedMax }, (_, itemIndex) => {
          const index = itemIndex + 1;
          const fill = Math.max(0, Math.min(1, displayedValue - itemIndex)) * 100;
          return (
            <span
              key={index}
              aria-hidden="true"
              className="relative block shrink-0"
              style={{ width: sizeToken.icon, height: sizeToken.icon }}
              onPointerMove={(event) => {
                if (!disabled && !readOnly) setPreviewValue(getPointerValue(event, index));
              }}
              onClick={(event) => commitValue(getPointerValue(event, index))}
            >
              <Star
                className="absolute inset-0 text-[var(--lumen-color-border-strong)]"
                size={sizeToken.icon}
                strokeWidth={1.75}
              />
              <span
                data-rating-fill
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{
                  width: `${fill}%`,
                  color: color ?? 'var(--lumen-color-rating)',
                }}
              >
                <Star
                  className="fill-current"
                  size={sizeToken.icon}
                  strokeWidth={1.75}
                />
              </span>
            </span>
          );
        })}
      </div>
    );
  },
);

Rating.displayName = 'Rating';
