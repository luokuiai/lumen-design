import React, { useId } from 'react';
import { cn } from './classNames';

export interface FormFieldRenderProps {
  id?: string;
  required?: boolean;
  invalid: boolean;
  'aria-invalid': boolean | undefined;
  'aria-describedby': string | undefined;
}

export type FormFieldSize = 'sm' | 'md' | 'lg';

export interface FormFieldProps {
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
  label,
  required = false,
  error,
  children,
  size = 'md',
  className,
  labelClassName,
  contentClassName,
  errorClassName,
  inputId,
}) => {
  const generatedId = useId();
  const errorId = error ? `${generatedId}-error` : undefined;
  const invalid = Boolean(error);
  const fieldProps: FormFieldRenderProps = {
    id: inputId,
    required,
    invalid,
    'aria-invalid': invalid || undefined,
    'aria-describedby': errorId,
  };
  const sizeTokens = formFieldSizeTokens[size];

  return (
    <div className={cn(sizeTokens.root, className)}>
      <label
        htmlFor={inputId}
        className={cn(
          'block font-medium text-[var(--lumen-color-text-secondary)]',
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
