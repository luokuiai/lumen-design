import React from 'react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaResize = 'none' | 'vertical';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: TextareaSize;
  resize?: TextareaResize;
  invalid?: boolean;
}

const textareaSizeTokens: Record<TextareaSize, string> = {
  sm: 'px-2.5 py-2 text-[12px] leading-5',
  md: 'px-3 py-2.5 text-[13px] leading-5',
  lg: 'px-3.5 py-3 text-[14px] leading-6',
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
      className,
      disabled,
      ...props
    },
    ref,
  ) => (
    <textarea
      ref={ref}
      disabled={disabled}
      className={cn(
        'w-full border bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text)] outline-none transition-all placeholder:text-[var(--lumen-color-text-placeholder)] disabled:cursor-not-allowed disabled:bg-[var(--lumen-color-surface-muted)] disabled:text-[var(--lumen-color-text-placeholder)] disabled:opacity-100',
        radiusTokens.control,
        textareaSizeTokens[size],
        resizeTokens[resize],
        getStateClassName(invalid),
        className,
      )}
      {...props}
      autoComplete="off"
    />
  ),
);

Textarea.displayName = 'Textarea';
