import React, { useId, useState } from 'react';
import { cn } from './classNames';
import { Radio, type RadioSize } from './Radio';

export type RadioGroupValue = string | number;
export type RadioGroupDirection = 'horizontal' | 'vertical';

export interface RadioGroupOption<T extends RadioGroupValue = string> {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends RadioGroupValue = string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  options: Array<RadioGroupOption<T>>;
  value?: T;
  defaultValue?: T;
  name?: string;
  size?: RadioSize;
  direction?: RadioGroupDirection;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: T) => void;
}

export const RadioGroup = <T extends RadioGroupValue = string>({
  options,
  value,
  defaultValue,
  name,
  size = 'sm',
  direction = 'vertical',
  disabled = false,
  required = false,
  onChange,
  className,
  role = 'radiogroup',
  ...props
}: RadioGroupProps<T>) => {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const currentValue = isControlled ? value : internalValue;

  const selectOption = (optionValue: T) => {
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    onChange?.(optionValue);
  };

  return (
    <div
      role={role}
      aria-disabled={disabled || undefined}
      className={cn(
        'flex',
        direction === 'horizontal'
          ? 'flex-row flex-wrap gap-x-5 gap-y-3'
          : 'flex-col gap-3',
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={groupName}
          value={option.value}
          size={size}
          checked={Object.is(option.value, currentValue)}
          disabled={disabled || option.disabled}
          required={required}
          label={option.label}
          description={option.description}
          onChange={(checked) => {
            if (checked) selectOption(option.value);
          }}
        />
      ))}
    </div>
  );
};
