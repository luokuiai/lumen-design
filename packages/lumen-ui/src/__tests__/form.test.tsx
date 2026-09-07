import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Form, FormField, Input, type FormProps } from '../index';

type Values = { name: string; email: string };
const initialValues = { name: '', email: '' };
const validate = (values: Values) => ({
  email: values.email.includes('@') ? undefined : 'Email is invalid',
  name: values.name.trim() ? undefined : 'Name is required',
});

function Example(props: Partial<Pick<FormProps<Values>, 'onFinish' | 'validate' | 'focusFirstError' | 'onReset' | 'showErrors' | 'onValidationFailed'>>) {
  const [values, setValues] = useState(initialValues);
  return (
    <Form aria-label="Example" values={values} validate={validate} onFinish={() => undefined}
      onReset={() => setValues(initialValues)} {...props}>
      {({ errors, isSubmitting, submitError }) => <>
        <span>{Object.keys(errors).length} errors</span>
        <FormField name="name" label="Name" required>
          {(field) => <Input {...field} value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />}
        </FormField>
        <FormField name="email" label="Email" required>
          {(field) => <Input {...field} type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} />}
        </FormField>
        <button type="submit" disabled={isSubmitting}>Submit</button>
        <button type="reset">Reset</button>
        {submitError instanceof Error && <div role="alert">{submitError.message}</div>}
      </>}
    </Form>
  );
}

function fill() {
  fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Lumen' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'demo@example.com' } });
}

describe('Form', () => {
  it('reports hidden errors to the caller only on failed submission', () => {
    const onValidationFailed = vi.fn();
    const onFinish = vi.fn();
    render(<Example showErrors={false} onValidationFailed={onValidationFailed} onFinish={onFinish} />);
    fireEvent.click(screen.getByText('Submit'));
    expect(onValidationFailed).toHaveBeenCalledExactlyOnceWith({ email: 'Email is invalid', name: 'Name is required' }, initialValues);
    expect(screen.queryByText('Email is invalid')).not.toBeInTheDocument();
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).not.toHaveAttribute('aria-describedby');
    expect(name).toHaveFocus();
    expect(onFinish).not.toHaveBeenCalled();
    fill();
    expect(onValidationFailed).toHaveBeenCalledTimes(1);
    expect(name).not.toHaveAttribute('aria-invalid');
  });

  it('keeps helper text when errors are hidden and can show the current error again', () => {
    const content = <FormField name="name" label="Name" helperText="Your full name">{(field) => <Input {...field} />}</FormField>;
    const { rerender } = render(<Form aria-label="Example" values={initialValues} validate={validate} onFinish={() => undefined} showErrors={false}>{content}</Form>);
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Your full name');
    rerender(<Form aria-label="Example" values={initialValues} validate={validate} onFinish={() => undefined} showErrors>{content}</Form>);
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Name is required');
  });

  it('waits for first submission, then updates feedback without moving focus', () => {
    const check = vi.fn(validate);
    render(<Example validate={check} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'invalid' } });
    expect(check).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Submit'));
    const email = screen.getByRole('textbox', { name: 'Email' });
    act(() => email.focus());
    fireEvent.change(email, { target: { value: 'demo@example.com' } });
    expect(screen.getByText('1 errors')).toBeInTheDocument();
    expect(email).toHaveFocus();
    expect(email).not.toHaveAttribute('aria-invalid');
    fireEvent.click(screen.getByText('Reset'));
    check.mockClear();
    fireEvent.change(email, { target: { value: 'invalid' } });
    expect(check).not.toHaveBeenCalled();
    expect(screen.getByText('0 errors')).toBeInTheDocument();
  });

  it('refreshes dependent field errors after programmatic value updates', () => {
    const check = (values: Values) => ({ email: values.name === values.email ? undefined : 'Values must match' });
    const onFinish = vi.fn();
    const content = <FormField name="email" label="Email">{(field) => <Input {...field} />}</FormField>;
    const { rerender } = render(<Form values={{ name: 'a', email: 'b' }} validate={check} onFinish={onFinish} aria-label="Example">{content}</Form>);
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByText('Values must match')).toBeInTheDocument();
    rerender(<Form values={{ name: 'b', email: 'b' }} validate={check} onFinish={onFinish} aria-label="Example">{content}</Form>);
    expect(screen.queryByText('Values must match')).not.toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
    rerender(<Form values={{ name: 'c', email: 'b' }} validate={check} onFinish={onFinish} aria-label="Example">{content}</Form>);
    expect(screen.getByText('Values must match')).toBeInTheDocument();
  });

  it('replaces helper text with errors and restores it without adding another message', () => {
    const renderField = (error?: string) => <FormField name="name" label="Name" helperText="Your full name" error={error}>
      {(field) => <Input {...field} />}
    </FormField>;
    const { rerender } = render(renderField());
    const message = screen.getByText('Your full name');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Your full name');
    rerender(renderField('Enter your name'));
    expect(screen.getByText('Enter your name')).toBe(message);
    expect(screen.queryByText('Your full name')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Enter your name');
    rerender(renderField());
    expect(screen.getByText('Your full name')).toBe(message);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('validates all fields together and focuses the first error in DOM order', () => {
    const onFinish = vi.fn();
    const check = vi.fn(validate);
    render(<Example onFinish={onFinish} validate={check} />);
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Submit'));
    expect(check).toHaveBeenCalledExactlyOnceWith(initialValues);
    expect(screen.getByText('2 errors')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAccessibleDescription('Name is required');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription('Email is invalid');
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('refreshes errors while editing after submission without saving automatically', async () => {
    const onFinish = vi.fn();
    render(<Example onFinish={onFinish} />);
    fireEvent.click(screen.getByText('Submit'));
    fill();
    expect(screen.getByText('0 errors')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(screen.getByText('Submit')).not.toBeDisabled());
    expect(onFinish).toHaveBeenCalledExactlyOnceWith({ name: 'Lumen', email: 'demo@example.com' });
    expect(screen.getByText('0 errors')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveAttribute('aria-invalid');
  });

  it('supports cross-field rules through the complete values object', async () => {
    const onFinish = vi.fn();
    render(<Example onFinish={onFinish} validate={(values) => ({ email: values.email === values.name ? undefined : 'Values must match' })} />);
    fill();
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Values must match')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'demo@example.com' } });
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
  });

  it('locks duplicate submissions and reset until an async submission completes', async () => {
    let resolve!: () => void;
    const onFinish = vi.fn(() => new Promise<void>((done) => { resolve = done; }));
    render(<Example onFinish={onFinish} />);
    fill();
    fireEvent.submit(screen.getByRole('form'));
    fireEvent.submit(screen.getByRole('form'));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('form')).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Lumen');
    await act(async () => resolve());
    expect(screen.getByText('Submit')).not.toBeDisabled();
    expect(screen.getByRole('form')).not.toHaveAttribute('aria-busy');
  });

  it('exposes submission exceptions and allows a retry', async () => {
    const onFinish = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(undefined);
    render(<Example onFinish={onFinish} />);
    fill();
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline');
    fireEvent.click(screen.getByText('Submit'));
    await waitFor(() => expect(screen.getByText('Submit')).not.toBeDisabled());
    expect(onFinish).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('resets validation feedback and lets the caller reset controlled values', () => {
    render(<Example />);
    fireEvent.click(screen.getByText('Submit'));
    fill();
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByText('0 errors')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('');
  });

  it('honors reset cancellation and disabled error focusing', () => {
    render(<Example focusFirstError={false} onReset={(event) => event.preventDefault()} />);
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveFocus();
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByText('2 errors')).toBeInTheDocument();
  });

  it('exposes validator exceptions without calling onFinish', () => {
    const onFinish = vi.fn();
    render(<Example onFinish={onFinish} validate={() => { throw new Error('Invalid validator'); }} />);
    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid validator');
    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });

  it('preserves standalone FormField errors and explicit IDs', () => {
    render(<FormField name="name" label="Name" inputId="custom-name" error="Server error">
      {(field) => <Input {...field} />}
    </FormField>);
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('id', 'custom-name');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAccessibleDescription('Server error');
  });
});
