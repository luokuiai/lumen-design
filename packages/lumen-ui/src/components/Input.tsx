import React from 'react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  size?: InputSize;
  invalid?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  inputClassName?: string;
}

const inputSizeTokens: Record<InputSize, string> = {
  sm: 'h-[32px] px-2.5 text-[12px]',
  md: 'h-[36px] px-3 text-[13px]',
  lg: 'h-[40px] px-3.5 text-[14px]',
};

const affixSizeTokens: Record<InputSize, string> = {
  sm: 'h-[32px] px-2.5 text-[12px]',
  md: 'h-[36px] px-3 text-[13px]',
  lg: 'h-[40px] px-3.5 text-[14px]',
};

const baseControlClassName =
  'w-full border bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text)] outline-none transition-all placeholder:text-[var(--lumen-color-text-placeholder)] disabled:cursor-not-allowed disabled:bg-[var(--lumen-color-surface-muted)] disabled:text-[var(--lumen-color-text-placeholder)] disabled:opacity-100';

const getStateClassName = (invalid?: boolean) =>
  invalid
    ? 'border-[var(--lumen-color-danger)] focus:border-[var(--lumen-color-danger)] focus:ring-2 focus:ring-[var(--lumen-color-danger)]/10'
    : 'border-[var(--lumen-color-border-strong)] hover:border-[var(--lumen-color-border-hover)] focus:border-[var(--lumen-color-primary)] focus:ring-2 focus:ring-[var(--lumen-color-primary)]/10';

const getAffixStateClassName = (invalid?: boolean) =>
  invalid
    ? 'border-[var(--lumen-color-danger)] focus-within:border-[var(--lumen-color-danger)] focus-within:ring-2 focus-within:ring-[var(--lumen-color-danger)]/10'
    : 'border-[var(--lumen-color-border-strong)] hover:border-[var(--lumen-color-border-hover)] focus-within:border-[var(--lumen-color-primary)] focus-within:ring-2 focus-within:ring-[var(--lumen-color-primary)]/10';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'lg',
      invalid = false,
      prefix,
      suffix,
      className,
      inputClassName,
      disabled,
      ...props
    },
    ref,
  ) => {
    if (prefix || suffix) {
      return (
        <div
          data-ui="input"
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          className={cn(
            'flex w-full items-center gap-2 border bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text)] outline-none transition-all',
            radiusTokens.control,
            affixSizeTokens[size],
            disabled
              ? 'cursor-not-allowed border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-placeholder)]'
              : getAffixStateClassName(invalid),
            className,
          )}
        >
          {prefix && (
            <span className="flex shrink-0 items-center text-[var(--lumen-color-text-placeholder)]">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-[var(--lumen-color-text-placeholder)] disabled:cursor-not-allowed',
              inputClassName,
            )}
            {...props}
            autoComplete="off"
          />
          {suffix && (
            <span className="flex shrink-0 items-center text-[var(--lumen-color-text-placeholder)]">
              {suffix}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        disabled={disabled}
        {...props}
        data-ui="input"
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          baseControlClassName,
          radiusTokens.control,
          inputSizeTokens[size],
          getStateClassName(invalid),
          className,
        )}
        autoComplete="off"
      />
    );
  },
);

Input.displayName = 'Input';
