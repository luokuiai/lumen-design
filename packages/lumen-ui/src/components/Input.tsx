import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';
import { useLumenLocale } from '../i18n';

export type InputSize = 'sm' | 'md' | 'lg';

export interface PasswordToggleLabels {
  show: string;
  hide: string;
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  size?: InputSize;
  invalid?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  inputClassName?: string;
  passwordToggle?: boolean;
  passwordToggleLabels?: PasswordToggleLabels;
}

const inputSizeTokens: Record<InputSize, string> = {
  sm: 'h-[var(--lumen-control-height-sm)] px-2.5 text-[13px] mobile:text-[16px]',
  md: 'h-[var(--lumen-control-height-md)] px-3 text-[14px] mobile:text-[16px]',
  lg: 'h-[var(--lumen-control-height-lg)] px-3.5 text-[15px] mobile:text-[16px]',
};

const affixSizeTokens: Record<InputSize, string> = {
  sm: 'h-[var(--lumen-control-height-sm)] px-2.5 text-[13px] mobile:text-[16px]',
  md: 'h-[var(--lumen-control-height-md)] px-3 text-[14px] mobile:text-[16px]',
  lg: 'h-[var(--lumen-control-height-lg)] px-3.5 text-[15px] mobile:text-[16px]',
};

const baseControlClassName =
  'w-full border bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text)] outline-none transition-all placeholder:text-[var(--lumen-color-text-placeholder)] disabled:cursor-not-allowed disabled:bg-[var(--lumen-color-surface-muted)] disabled:text-[var(--lumen-color-text-placeholder)] disabled:opacity-100';

const getStateClassName = (invalid?: boolean) =>
  invalid
    ? 'border-[var(--lumen-color-danger)] focus:border-[var(--lumen-color-danger)] focus:ring-2 focus:ring-[var(--lumen-color-danger)]/10'
    : 'border-[var(--lumen-color-border)] hover:border-[var(--lumen-color-border-hover)] focus:border-[var(--lumen-color-primary)] focus:ring-2 focus:ring-[var(--lumen-color-primary)]/10';

const getAffixStateClassName = (invalid?: boolean) =>
  invalid
    ? 'border-[var(--lumen-color-danger)] focus-within:border-[var(--lumen-color-danger)] focus-within:ring-2 focus-within:ring-[var(--lumen-color-danger)]/10'
    : 'border-[var(--lumen-color-border)] hover:border-[var(--lumen-color-border-hover)] focus-within:border-[var(--lumen-color-primary)] focus-within:ring-2 focus-within:ring-[var(--lumen-color-primary)]/10';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      invalid = false,
      prefix,
      suffix,
      className,
      inputClassName,
      disabled,
      type,
      passwordToggle = false,
      passwordToggleLabels,
      ...props
    },
    ref,
  ) => {
    const locale = useLumenLocale();
    const resolvedPasswordToggleLabels = passwordToggleLabels ?? {
      show: locale.accessibility.passwordShow,
      hide: locale.accessibility.passwordHide,
    };
    const [passwordVisible, setPasswordVisible] = useState(false);
    const showPasswordToggle = passwordToggle && type === 'password';
    const resolvedType = showPasswordToggle && passwordVisible ? 'text' : type;

    if (prefix || suffix || showPasswordToggle) {
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
            type={resolvedType}
            className={cn(
              'min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-[var(--lumen-color-text-placeholder)] disabled:cursor-not-allowed',
              inputClassName,
            )}
            {...props}
          />
          {suffix && (
            <span className="flex shrink-0 items-center text-[var(--lumen-color-text-placeholder)]">
              {suffix}
            </span>
          )}
          {showPasswordToggle && (
            <button
              type="button"
              aria-label={passwordVisible ? resolvedPasswordToggleLabels.hide : resolvedPasswordToggleLabels.show}
              aria-pressed={passwordVisible}
              disabled={disabled}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--lumen-radius-icon)] text-[var(--lumen-color-text-placeholder)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed"
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => setPasswordVisible((visible) => !visible)}
            >
              {passwordVisible
                ? <EyeOff aria-hidden="true" size={16} />
                : <Eye aria-hidden="true" size={16} />}
            </button>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        disabled={disabled}
        type={resolvedType}
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
      />
    );
  },
);

Input.displayName = 'Input';
