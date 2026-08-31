import React, { useId, useState } from 'react';
import { cn } from './classNames';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onChange'> {
  size?: 'sm' | 'md';
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  onChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({
  size = 'md',
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
        'inline-flex items-center gap-3',
        disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
        className,
      )}
    >
      {(label || description) && (
        <span className="min-w-0">
          {label ? (
          <span id={labelId} className="block text-[14px] font-normal text-[var(--lumen-color-text)]">
              {label}
            </span>
          ) : null}
          {description ? (
            <span id={descriptionId} className="mt-0.5 block text-[12px] leading-5 text-[var(--lumen-color-text-muted)]">
              {description}
            </span>
          ) : null}
        </span>
      )}
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center',
          isSmall ? 'h-4 w-7' : 'h-5 w-9',
        )}
        data-switch-track
        data-checked={currentChecked ? 'true' : 'false'}
      >
        <input
          {...props}
          id={inputId}
          type="checkbox"
          role="switch"
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
            'absolute inset-0 rounded-full transition-colors duration-200 ease-out',
            currentChecked ? 'bg-[var(--lumen-color-primary)] shadow-[0_10px_24px_var(--lumen-color-focus-ring)]' : 'bg-[var(--lumen-color-border-hover)]',
            !disabled && 'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--lumen-color-info-border)]/70 peer-focus-visible:ring-offset-2',
          )}
        />
        <span
          aria-hidden="true"
          data-switch-knob
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-full border border-[var(--lumen-color-surface)]/80 bg-[var(--lumen-color-surface)] shadow-[0_2px_8px_var(--lumen-color-shadow)] transition-transform duration-200 ease-out',
            isSmall ? 'left-[2px] h-3 w-3' : 'left-[2px] h-4 w-4',
            currentChecked ? (isSmall ? 'translate-x-3' : 'translate-x-4') : 'translate-x-0',
          )}
        />
      </span>
    </label>
  );
};
