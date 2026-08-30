import React from 'react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextareaSize;
  resize?: TextareaResize;
  invalid?: boolean;
  showCount?: boolean;
}

const textareaSizeTokens: Record<TextareaSize, string> = {
  sm: 'px-2.5 py-2 text-[13px] leading-5 mobile:text-[16px]',
  md: 'px-3 py-2.5 text-[14px] leading-5 mobile:text-[16px]',
  lg: 'px-3.5 py-3 text-[14px] leading-6 mobile:text-[16px]',
};

const resizeTokens: Record<TextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
};

const getStateClassName = (invalid?: boolean) =>
  invalid
    ? 'border-[var(--lumen-color-danger)] focus:border-[var(--lumen-color-danger)] focus:ring-2 focus:ring-[var(--lumen-color-danger)]/10'
    : 'border-[var(--lumen-color-border-strong)] hover:border-[var(--lumen-color-border-hover)] focus:border-[var(--lumen-color-primary)] focus:ring-2 focus:ring-[var(--lumen-color-primary)]/10';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'lg',
      resize = 'vertical',
      invalid = false,
      showCount = false,
      className,
      disabled,
      value,
      defaultValue,
      maxLength,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledCount, setUncontrolledCount] = React.useState(
      () => String(defaultValue ?? '').length,
    );
    const currentCount = value === undefined
      ? uncontrolledCount
      : String(value ?? '').length;
    const textarea = (
      <textarea
        ref={ref}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={(event) => {
          if (value === undefined) setUncontrolledCount(event.target.value.length);
          onChange?.(event);
        }}
        {...props}
        data-ui="textarea"
        data-invalid={invalid || undefined}
        className={cn(
          'w-full border bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text)] outline-none transition-all placeholder:text-[var(--lumen-color-text-placeholder)] disabled:cursor-not-allowed disabled:bg-[var(--lumen-color-surface-muted)] disabled:text-[var(--lumen-color-text-placeholder)] disabled:opacity-100',
          radiusTokens.control,
          textareaSizeTokens[size],
          resizeTokens[resize],
          showCount && 'pb-7',
          getStateClassName(invalid),
          className,
        )}
        autoComplete="off"
      />
    );

    if (!showCount) return textarea;

    return (
      <div className="relative w-full">
        {textarea}
        <span
          aria-live="polite"
          className="pointer-events-none absolute bottom-2 right-3 text-[12px] leading-4 text-[var(--lumen-color-text-placeholder)]"
        >
          {currentCount}{maxLength === undefined ? null : `/${maxLength}`}
        </span>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
