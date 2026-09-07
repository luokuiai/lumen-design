import React, { useContext, useId } from 'react';
import { cn } from './classNames';
import { FormContext } from './form/formContext';

export interface FormFieldRenderProps {
  name?: string;
  id?: string;
  required?: boolean;
  invalid: boolean;
  'aria-invalid': boolean | undefined;
  'aria-describedby': string | undefined;
}

export type FormFieldSize = 'sm' | 'md' | 'lg';

export interface FormFieldProps {
  /** Match a key in Form values to receive its submit-time validation error. */
  name?: string;
  label: React.ReactNode;
  required?: boolean;
  error?: React.ReactNode;
  /** Optional guidance, replaced by the error message in the same text area. */
  helperText?: React.ReactNode;
  /** Use the message area as field spacing. Defaults to true inside Form. */
  reserveMessageSpace?: boolean;
  children: React.ReactNode | ((props: FormFieldRenderProps) => React.ReactNode);
  size?: FormFieldSize;
  className?: string;
  labelClassName?: string;
  contentClassName?: string;
  errorClassName?: string;
  inputId?: string;
}

const formFieldSizeTokens: Record<FormFieldSize, {
  root: string;
  label: string;
  error: string;
}> = {
  sm: {
    root: 'space-y-1',
    label: 'text-[13px]',
    error: 'text-[12px]',
  },
  md: {
    root: 'space-y-1.5',
    label: 'text-[14px]',
    error: 'text-[12px]',
  },
  lg: {
    root: 'space-y-2',
    label: 'text-[14px]',
    error: 'text-[12px]',
  },
};

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required = false,
  error: errorProp,
  helperText,
  reserveMessageSpace,
  children,
  size = 'md',
  className,
  labelClassName,
  contentClassName,
  errorClassName,
  inputId: inputIdProp,
}) => {
  const generatedId = useId();
  const form = useContext(FormContext);
  const reserveSpace = reserveMessageSpace ?? Boolean(form);
  const error = errorProp !== undefined ? errorProp : name ? form?.errors[name] : undefined;
  const visibleError = form?.showErrors === false ? undefined : error;
  const inputId = inputIdProp ?? (name ? `${generatedId}-input` : undefined);
  const errorId = visibleError ? `${generatedId}-error` : undefined;
  const descriptionId = errorId ?? (helperText ? `${generatedId}-help` : undefined);
  const invalid = Boolean(error);
  const fieldProps: FormFieldRenderProps = {
    name,
    id: inputId,
    required,
    invalid,
    'aria-invalid': invalid || undefined,
    'aria-describedby': descriptionId,
  };
  const sizeTokens = formFieldSizeTokens[size];

  return (
    <div data-lumen-form-field-invalid={invalid || undefined} className={cn(!reserveSpace && sizeTokens.root, className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'block font-normal text-[var(--lumen-color-text-secondary)]',
          sizeTokens.label,
          reserveSpace && (size === 'sm' ? 'mb-1' : size === 'lg' ? 'mb-2' : 'mb-1.5'),
          labelClassName,
        )}
      >
        <span>{label}</span>
        <span
          aria-hidden="true"
          className={cn(
            'ml-1 inline-block w-[0.5em] align-middle text-[var(--lumen-color-danger)]',
            required ? 'opacity-100' : 'opacity-0',
          )}
        >
          *
        </span>
      </label>
      <div className={contentClassName}>
        {typeof children === 'function' ? children(fieldProps) : children}
      </div>
      {(reserveSpace || visibleError || helperText) && (
        <div
          data-lumen-form-field-message
          className={reserveSpace ? 'min-h-5 pt-0.5' : undefined}
        >
          {(visibleError || helperText) && (
            <p id={descriptionId} className={cn(
              'break-words',
              reserveSpace && 'leading-4',
              visibleError ? 'text-[var(--lumen-color-danger)]' : 'text-[var(--lumen-color-text-muted)]',
              sizeTokens.error,
              Boolean(visibleError) && errorClassName,
            )}>
              {visibleError || helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
