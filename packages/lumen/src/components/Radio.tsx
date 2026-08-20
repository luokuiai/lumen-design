import React, { useId, useState } from 'react';
import { Circle } from 'lucide-react';
import { cn } from './classNames';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'> {
  size?: 'sm' | 'md';
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  onChange?: (checked: boolean) => void;
}

export const Radio: React.FC<RadioProps> = ({
  size = 'sm',
  checked,
  defaultChecked = false,
  disabled = false,
  label,
  description,
  onChange,
  className,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;
  const descriptionId = `${inputId}-description`;
  const isControlled = typeof checked === 'boolean';
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const currentChecked = isControlled ? checked : internalChecked;
  const isSmall = size === 'sm';
  const hasDescription = Boolean(description);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const nextChecked = event.target.checked;
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }
    onChange?.(nextChecked);
  };

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
          id={inputId}
          type="radio"
          checked={currentChecked}
          disabled={disabled}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          aria-label={typeof label === 'string' ? label : props['aria-label']}
          className="peer sr-only"
          onChange={handleChange}
        />
        <span
          aria-hidden="true"
          className={cn(
            'flex items-center justify-center rounded-full border transition-all',
            isSmall ? 'h-4 w-4' : 'h-5 w-5',
            currentChecked
              ? 'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-primary)] shadow-[0_8px_18px_var(--lumen-color-focus-ring)]'
              : 'border-[var(--lumen-color-border-hover)] bg-[var(--lumen-color-surface)] text-transparent',
            !disabled && 'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--lumen-color-info-border)]/70 peer-focus-visible:ring-offset-2',
            !disabled && !currentChecked && 'hover:border-[var(--lumen-color-info-border)] hover:bg-[var(--lumen-color-surface-hover)]',
          )}
        >
          <Circle
            size={isSmall ? 8 : 10}
            className={currentChecked ? 'fill-current text-current' : 'text-transparent'}
          />
        </span>
      </span>
      {(label || description) && (
        <span className="min-w-0">
          {label ? (
            <span
              id={labelId}
              className={cn(
                'block font-normal',
                currentChecked ? 'text-[var(--lumen-color-text)]' : 'text-[var(--lumen-color-text-muted)]',
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
