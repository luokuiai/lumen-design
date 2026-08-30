import React, { useState } from 'react';
import { cn } from './classNames';

export type SliderSize = 'sm' | 'md' | 'lg';
export type SliderStatus = 'info' | 'success' | 'warning' | 'danger';

export interface SliderMark {
  value: number;
  label?: React.ReactNode;
}

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'max' | 'min' | 'onChange' | 'size' | 'type' | 'value'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  size?: SliderSize;
  status?: SliderStatus;
  label?: React.ReactNode;
  showValue?: boolean;
  marks?: SliderMark[];
  formatValue?: (value: number) => React.ReactNode;
  onChange?: (value: number) => void;
}

const sliderHeightClassNames: Record<SliderSize, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

const sliderColorVariables: Record<SliderStatus, string> = {
  info: 'var(--lumen-color-primary)',
  success: 'var(--lumen-color-success)',
  warning: 'var(--lumen-color-warning)',
  danger: 'var(--lumen-color-danger)',
};

const clampSliderValue = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      size = 'md',
      status = 'info',
      label,
      showValue = false,
      marks,
      formatValue,
      onChange,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const safeMax = max > min ? max : min + 100;
    const controlled = typeof value === 'number';
    const [internalValue, setInternalValue] = useState(
      clampSliderValue(defaultValue ?? min, min, safeMax),
    );
    const currentValue = clampSliderValue(controlled ? value : internalValue, min, safeMax);
    const percentage = ((currentValue - min) / (safeMax - min)) * 100;
    const valueLabel = formatValue?.(currentValue) ?? currentValue;
    const color = sliderColorVariables[status];

    return (
      <div
        data-ui="slider"
        data-size={size}
        data-status={status}
        className={cn('min-w-0', disabled && 'opacity-50', className)}
      >
        {label || showValue ? (
          <div className="mb-2 flex items-center justify-between gap-3 text-[13px] leading-5">
            <span className="min-w-0 font-medium text-[var(--lumen-color-text-secondary)]">{label}</span>
            {showValue ? (
              <span className="shrink-0 text-[var(--lumen-color-text)]">{valueLabel}</span>
            ) : null}
          </div>
        ) : null}
        <div className="relative flex h-5 items-center">
          <div
            className={cn(
              'pointer-events-none absolute left-0 right-0 overflow-hidden rounded-full bg-[var(--lumen-color-surface-muted)]',
              sliderHeightClassNames[size],
            )}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${percentage}%`, backgroundColor: color }}
            />
          </div>
          <input
            {...props}
            ref={ref}
            type="range"
            min={min}
            max={safeMax}
            step={step}
            value={currentValue}
            disabled={disabled}
            aria-valuetext={typeof valueLabel === 'string' || typeof valueLabel === 'number' ? String(valueLabel) : undefined}
            className="absolute inset-0 h-5 w-full cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-not-allowed [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--lumen-color-surface)] [&::-moz-range-thumb]:bg-[var(--lumen-slider-color)] [&::-moz-range-thumb]:shadow-[0_1px_4px_var(--lumen-color-shadow)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--lumen-color-surface)] [&::-webkit-slider-thumb]:bg-[var(--lumen-slider-color)] [&::-webkit-slider-thumb]:shadow-[0_1px_4px_var(--lumen-color-shadow)] focus-visible:[&::-moz-range-thumb]:ring-4 focus-visible:[&::-moz-range-thumb]:ring-[var(--lumen-color-focus-ring)] focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-[var(--lumen-color-focus-ring)]"
            style={{
              accentColor: color,
              '--lumen-slider-color': color,
            } as React.CSSProperties}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (!controlled) setInternalValue(nextValue);
              onChange?.(nextValue);
            }}
          />
        </div>
        {marks?.length ? (
          <div className="relative mt-1 h-5 text-[12px] text-[var(--lumen-color-text-placeholder)]">
            {marks.map((mark) => {
              const markPercentage = ((clampSliderValue(mark.value, min, safeMax) - min) / (safeMax - min)) * 100;
              return (
                <span
                  key={mark.value}
                  className="absolute -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${markPercentage}%` }}
                >
                  {mark.label ?? mark.value}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  },
);

Slider.displayName = 'Slider';
