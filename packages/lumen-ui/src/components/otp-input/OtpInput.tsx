import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../classNames';
import type { InputSize } from '../Input';

export type OtpInputType = 'numeric' | 'text';

export interface OtpInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** 受控模式下的验证码值。 */
  value?: string;
  /** 非受控模式下的初始验证码。 */
  defaultValue?: string;
  /** 验证码变化时触发。 */
  onChange?: (value: string) => void;
  /** 所有输入格填写完成时触发。 */
  onComplete?: (value: string) => void;
  /** 验证码位数。 */
  length?: number;
  /** 允许输入数字或字母数字。 */
  type?: OtpInputType;
  /** 是否隐藏每一位验证码。 */
  mask?: boolean;
  /** 是否禁用全部输入格。 */
  disabled?: boolean;
  /** 是否将全部输入格设为只读。 */
  readOnly?: boolean;
  /** 是否显示错误状态。 */
  invalid?: boolean;
  /** 输入格尺寸。 */
  size?: InputSize;
  /** 是否在挂载后聚焦第一格。 */
  autoFocus?: boolean;
  /** 第一格使用的自动填充提示。 */
  autoComplete?: string;
  /** 表单提交字段名称。 */
  name?: string;
  /** 每个输入格的附加类名。 */
  inputClassName?: string;
  /** 自定义单个输入格的无障碍标签。 */
  getInputLabel?: (index: number, length: number) => string;
}

const sizeClassNames: Record<InputSize, string> = {
  sm: 'h-9 w-9 text-[16px]',
  md: 'h-11 w-11 text-[18px]',
  lg: 'h-13 w-13 text-[20px]',
};

const sanitizeValue = (value: string, type: OtpInputType, length: number) => {
  const pattern = type === 'numeric' ? /\D/g : /[^a-zA-Z0-9]/g;
  return value.replace(pattern, '').slice(0, length);
};

export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      onComplete,
      length = 6,
      type = 'numeric',
      mask = false,
      disabled = false,
      readOnly = false,
      invalid = false,
      size = 'md',
      autoFocus = false,
      autoComplete = 'one-time-code',
      name,
      inputClassName,
      getInputLabel = (index, total) => `Digit ${index + 1} of ${total}`,
      className,
      'aria-label': ariaLabel = 'One-time password',
      ...props
    },
    ref,
  ) => {
    const resolvedLength = Math.max(1, Math.floor(length));
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(() =>
      sanitizeValue(defaultValue, type, resolvedLength),
    );
    const currentValue = sanitizeValue(
      controlled ? value : internalValue,
      type,
      resolvedLength,
    );
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
      if (autoFocus && !disabled) inputRefs.current[0]?.focus();
    }, [autoFocus, disabled]);

    const focusInput = (index: number) => {
      inputRefs.current[Math.max(0, Math.min(index, resolvedLength - 1))]?.focus();
    };

    const commitValue = (nextValue: string) => {
      const normalizedValue = sanitizeValue(nextValue, type, resolvedLength);
      if (normalizedValue === currentValue) return;
      if (!controlled) setInternalValue(normalizedValue);
      onChange?.(normalizedValue);
      if (normalizedValue.length === resolvedLength) onComplete?.(normalizedValue);
    };

    const insertValue = (index: number, insertedValue: string) => {
      const normalizedValue = sanitizeValue(insertedValue, type, resolvedLength);
      if (!normalizedValue) return;
      const nextValue = (
        currentValue.slice(0, index)
        + normalizedValue
        + currentValue.slice(index + normalizedValue.length)
      ).slice(0, resolvedLength);
      commitValue(nextValue);
      focusInput(Math.min(index + normalizedValue.length, resolvedLength - 1));
    };

    return (
      <div
        {...props}
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        data-ui="otp-input"
        data-invalid={invalid || undefined}
        className={cn('inline-flex max-w-full items-center gap-2', className)}
      >
        {name ? <input type="hidden" name={name} value={currentValue} disabled={disabled} /> : null}
        {Array.from({ length: resolvedLength }, (_, index) => (
          <input
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            type={mask ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            pattern={type === 'numeric' ? '[0-9]*' : undefined}
            autoComplete={index === 0 ? autoComplete : 'off'}
            maxLength={resolvedLength}
            value={currentValue[index] ?? ''}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={getInputLabel(index, resolvedLength)}
            aria-invalid={invalid || undefined}
            className={cn(
              'shrink min-w-0 rounded-[var(--lumen-radius-control)] border bg-[var(--lumen-color-surface)] text-center font-medium text-[var(--lumen-color-text-strong)] caret-[var(--lumen-color-primary)] outline-none transition-[border-color,box-shadow,background-color] focus:border-[var(--lumen-color-primary)] focus:ring-2 focus:ring-[var(--lumen-color-primary)]/15 disabled:cursor-not-allowed disabled:bg-[var(--lumen-color-surface-muted)] disabled:text-[var(--lumen-color-text-placeholder)]',
              invalid
                ? 'border-[var(--lumen-color-danger)] focus:border-[var(--lumen-color-danger)] focus:ring-[var(--lumen-color-danger)]/15'
                : 'border-[var(--lumen-color-border)] hover:border-[var(--lumen-color-border-strong)]',
              sizeClassNames[size],
              inputClassName,
            )}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => {
              const nextInput = event.currentTarget.value;
              if (!nextInput) {
                commitValue(currentValue.slice(0, index) + currentValue.slice(index + 1));
                return;
              }
              insertValue(index, nextInput);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !currentValue[index] && index > 0) {
                event.preventDefault();
                commitValue(currentValue.slice(0, index - 1) + currentValue.slice(index));
                focusInput(index - 1);
              } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                focusInput(index - 1);
              } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                focusInput(index + 1);
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              insertValue(index, event.clipboardData.getData('text'));
            }}
          />
        ))}
      </div>
    );
  },
);

OtpInput.displayName = 'OtpInput';
