import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OtpInput } from '../components/otp-input/OtpInput';

const ControlledOtpInput = ({ onComplete }: { onComplete?: (value: string) => void }) => {
  const [value, setValue] = useState('');
  return <OtpInput value={value} onChange={setValue} onComplete={onComplete} />;
};

describe('OtpInput', () => {
  it('moves focus forward while entering numeric values', async () => {
    const user = userEvent.setup();
    render(<ControlledOtpInput />);
    const inputs = screen.getAllByRole('textbox');

    await user.type(inputs[0]!, '1');

    expect(inputs[0]!).toHaveValue('1');
    expect(inputs[1]!).toHaveFocus();
  });

  it('pastes a full code and reports completion', () => {
    const onComplete = vi.fn();
    render(<ControlledOtpInput onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.paste(inputs[0]!, {
      clipboardData: { getData: () => '12 34-56' },
    });

    expect(inputs.map((input) => (input as HTMLInputElement).value).join('')).toBe('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('removes the previous value when backspacing an empty input', async () => {
    const user = userEvent.setup();
    render(<OtpInput defaultValue="12" />);
    const inputs = screen.getAllByRole('textbox');
    inputs[2]!.focus();

    await user.keyboard('{Backspace}');

    expect(inputs[1]!).toHaveValue('');
    expect(inputs[1]!).toHaveFocus();
  });

  it('filters non-numeric input by default', () => {
    const onChange = vi.fn();
    render(<OtpInput value="" onChange={onChange} />);

    fireEvent.change(screen.getAllByRole('textbox')[0]!, { target: { value: 'a1' } });

    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('supports masked, invalid, and disabled states', () => {
    render(<OtpInput defaultValue="12" mask invalid disabled />);
    const inputs = screen.getAllByLabelText(/Digit/);

    expect(inputs[0]!).toHaveAttribute('type', 'password');
    expect(inputs[0]!).toHaveAttribute('aria-invalid', 'true');
    expect(inputs[0]!).toBeDisabled();
  });
});
