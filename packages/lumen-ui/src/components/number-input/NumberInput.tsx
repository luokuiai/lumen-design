import { Minus, Plus } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { cn } from '../classNames';
import { Input, type InputProps } from '../Input';

export interface NumberInputProps
  extends Omit<
    InputProps,
    'defaultValue' | 'onChange' | 'passwordToggle' | 'passwordToggleLabels' | 'type' | 'value'
  > {
  value?: number | null;
  defaultValue?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onValueChange?: (value: number | null) => void;
  controls?: boolean;
  incrementLabel?: string;
  decrementLabel?: string;
}

const readInputValue = (input: HTMLInputElement): number | null =>
  input.value === '' || Number.isNaN(input.valueAsNumber) ? null : input.valueAsNumber;

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      controls = true,
      incrementLabel = '增加',
      decrementLabel = '减少',
      prefix,
      suffix,
      disabled,
      readOnly,
      inputMode = 'decimal',
      ...props
    },
    forwardedRef,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<number | null>(defaultValue ?? null);
    const currentValue = controlled ? value : internalValue;
    const min = props.min == null ? null : Number(props.min);
    const max = props.max == null ? null : Number(props.max);
    const decrementDisabled = disabled || readOnly || (
      currentValue != null && min != null && currentValue <= min
    );
    const incrementDisabled = disabled || readOnly || (
      currentValue != null && max != null && currentValue >= max
    );

    const setInputRef = useCallback((node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    const commitValue = (nextValue: number | null) => {
      if (!controlled) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      onChange?.(event);
      commitValue(readInputValue(event.currentTarget));
    };

    const stepValue = (direction: 'up' | 'down') => {
      const input = inputRef.current;
      if (!input) return;
      try {
        if (direction === 'up') input.stepUp();
        else input.stepDown();
      } catch {
        return;
      }
      commitValue(readInputValue(input));
      input.focus();
    };

    const composedSuffix = suffix || controls ? (
      <span className="flex items-center gap-1.5">
        {suffix ? <span className="flex items-center">{suffix}</span> : null}
        {controls ? (
          <span className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label={decrementLabel}
              disabled={decrementDisabled}
              className="flex h-6 w-6 items-center justify-center rounded-[var(--lumen-radius-icon)] text-[var(--lumen-color-text-muted)] outline-none transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text)] focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-40"
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => stepValue('down')}
            >
              <Minus aria-hidden="true" size={14} />
            </button>
            <button
              type="button"
              aria-label={incrementLabel}
              disabled={incrementDisabled}
              className="flex h-6 w-6 items-center justify-center rounded-[var(--lumen-radius-icon)] text-[var(--lumen-color-text-muted)] outline-none transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text)] focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-40"
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => stepValue('up')}
            >
              <Plus aria-hidden="true" size={14} />
            </button>
          </span>
        ) : null}
      </span>
    ) : undefined;

    return (
      <Input
        {...props}
        ref={setInputRef}
        type="number"
        inputMode={inputMode}
        prefix={prefix}
        suffix={composedSuffix}
        disabled={disabled}
        readOnly={readOnly}
        value={controlled ? value ?? '' : undefined}
        defaultValue={controlled ? undefined : defaultValue}
        onChange={handleChange}
        data-number-input=""
        inputClassName={cn('[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none', props.inputClassName)}
      />
    );
  },
);

NumberInput.displayName = 'NumberInput';
