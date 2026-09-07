import React, { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../classNames';
import { FormContext } from './formContext';

export type FormErrors<TValues extends object> = Partial<Record<Extract<keyof TValues, string>, string>>;

export interface FormRenderProps<TValues extends object> {
  errors: FormErrors<TValues>;
  isSubmitting: boolean;
  /** An exception from validation or submission; render application-specific feedback. */
  submitError: unknown;
}

export interface FormProps<TValues extends object>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'children' | 'onSubmit' | 'noValidate'> {
  /** Current field values, owned by the caller. */
  values: TValues;
  /** Check every field in one synchronous pass. Return an empty object when valid. */
  validate: (values: TValues) => FormErrors<TValues>;
  /** Called only when the entire form is valid. A promise keeps submission locked. */
  onFinish: (values: TValues) => void | Promise<void>;
  focusFirstError?: boolean;
  children: React.ReactNode | ((state: FormRenderProps<TValues>) => React.ReactNode);
}

/** Validates all fields on submit and shares errors with named FormField children. */
export function Form<TValues extends object>({
  values, validate, onFinish, focusFirstError = true, children,
  className, onReset, ...props
}: FormProps<TValues>) {
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [validationAttempt, setValidationAttempt] = useState(0);

  useLayoutEffect(() => {
    if (!validationAttempt || !focusFirstError) return;
    const fields = formRef.current?.querySelectorAll<HTMLElement>('[data-lumen-form-field-invalid]');
    for (const field of fields ?? []) {
      if (field.closest('[hidden], [inert]')) continue;
      const control = field.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])',
      );
      if (!control) continue;
      control.focus();
      control.scrollIntoView?.({ block: 'nearest' });
      break;
    }
  }, [validationAttempt, focusFirstError]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setSubmitError(null);
    try {
      const nextErrors = Object.fromEntries(
        Object.entries(validate(values)).filter(([, message]) => typeof message === 'string' && message.length > 0),
      ) as FormErrors<TValues>;
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        setValidationAttempt((attempt) => attempt + 1);
        return;
      }
      setIsSubmitting(true);
      await onFinish(values);
    } catch (error) {
      setSubmitError(error);
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider value={{ errors }}>
      <form
        {...props}
        ref={formRef}
        noValidate
        aria-busy={isSubmitting || undefined}
        className={cn('space-y-4', className)}
        onSubmit={submit}
        onReset={(event) => {
          if (submitting.current) {
            event.preventDefault();
            return;
          }
          onReset?.(event);
          if (event.defaultPrevented) return;
          setErrors({});
          setSubmitError(null);
          setValidationAttempt(0);
        }}
      >
        {typeof children === 'function' ? children({ errors, isSubmitting, submitError }) : children}
      </form>
    </FormContext.Provider>
  );
}
