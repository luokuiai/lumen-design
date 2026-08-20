import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from './classNames';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'> {
  size?: 'sm' | 'md';
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  size = 'sm',
  checked,
  defaultChecked = false,
  disabled = false,
  indeterminate = false,
  label,
  description,
  onChange,
  className,
  id,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;
  const descriptionId = `${inputId}-description`;
  const isControlled = typeof checked === 'boolean';
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const currentChecked = isControlled ? checked : internalChecked;
  const isSmall = size === 'sm';
  const hasDescription = Boolean(description);
  const explicitAriaLabel = props['aria-label'];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, currentChecked]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const nextChecked = event.target.checked;
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }
    onChange?.(nextChecked);
  };

  const indicatorVisible = indeterminate || currentChecked;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex gap-3',
        hasDescription ? 'items-start' : 'items-center',
        isSmall && 'gap-2',
        disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
        className,
      )}
    >
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center',
          hasDescription && 'mt-0.5',
          isSmall ? 'h-4 w-4' : 'h-5 w-5',
        )}
      >
        <input
          {...props}
          ref={inputRef}
          id={inputId}
          type="checkbox"
          checked={currentChecked}
          disabled={disabled}
          aria-labelledby={!explicitAriaLabel && label ? labelId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          aria-label={explicitAriaLabel ?? (typeof label === 'string' ? label : undefined)}
          aria-checked={indeterminate ? 'mixed' : currentChecked}
          className="peer sr-only"
          onChange={handleChange}
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex items-center justify-center border transition-all',
            isSmall ? 'h-4 w-4 rounded-[4px]' : 'h-5 w-5 rounded-[5px]',
            indicatorVisible
              ? 'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)] shadow-[0_8px_18px_var(--lumen-color-focus-ring)]'
              : 'border-[var(--lumen-color-border-hover)] bg-[var(--lumen-color-surface)] text-transparent',
            !disabled && 'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--lumen-color-info-border)]/70 peer-focus-visible:ring-offset-2',
            !disabled && !indicatorVisible && 'hover:border-[var(--lumen-color-info-border)] hover:bg-[var(--lumen-color-surface-hover)]',
          )}
        >
          {indeterminate ? (
            <Minus size={isSmall ? 11 : 13} strokeWidth={3} />
          ) : (
            <Check size={isSmall ? 11 : 13} strokeWidth={3} />
          )}
        </span>
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label ? (
            <span
              id={labelId}
              className={cn(
                'block font-normal',
                indicatorVisible ? 'text-[var(--lumen-color-text)]' : 'text-[var(--lumen-color-text-muted)]',
                isSmall ? 'text-[13px] leading-5' : 'text-[13px] leading-5',
              )}
            >
              {label}
            </span>
          ) : null}
          {description ? (
            <span
              id={descriptionId}
              className={cn(
                'mt-0.5 block text-[var(--lumen-color-text-muted)]',
                isSmall ? 'text-[11px] leading-4.5' : 'text-[12px] leading-5',
              )}
            >
              {description}
            </span>
          ) : null}
        </span>
      )}
    </label>
  );
};
