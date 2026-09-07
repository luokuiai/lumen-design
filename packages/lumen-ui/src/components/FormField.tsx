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
  const error = errorProp !== undefined ? errorProp : name ? form?.errors[name] : undefined;
  const inputId = inputIdProp ?? (name ? `${generatedId}-input` : undefined);
  const errorId = error ? `${generatedId}-error` : undefined;
  const invalid = Boolean(error);
  const fieldProps: FormFieldRenderProps = {
    name,
    id: inputId,
    required,
    invalid,
    'aria-invalid': invalid || undefined,
    'aria-describedby': errorId,
  };
  const sizeTokens = formFieldSizeTokens[size];

  return (
    <div data-lumen-form-field-invalid={invalid || undefined} className={cn(sizeTokens.root, className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'block font-normal text-[var(--lumen-color-text-secondary)]',
          sizeTokens.label,
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
      {error && (
        <p id={errorId} className={cn('text-[var(--lumen-color-danger)]', sizeTokens.error, errorClassName)}>
          {error}
        </p>
      )}
    </div>
  );
};
