import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from '../components/Radio';
import { RadioGroup } from '../components/RadioGroup';

const options = [
  { value: 'email', label: 'Email', description: 'Receive an email' },
  { value: 'sms', label: 'SMS' },
  { value: 'none', label: 'None', disabled: true },
] as const;

describe('RadioGroup', () => {
  it('keeps the medium radio visually compact', () => {
    render(<Radio size="md" checked label="Medium" />);

    const radio = screen.getByRole('radio', { name: 'Medium' });
    expect(radio.closest('label')).toHaveClass('gap-2.5');
    expect(radio.parentElement).toHaveClass('h-[18px]', 'w-[18px]');
    expect(radio.nextElementSibling).toHaveClass('h-[18px]', 'w-[18px]');
    expect(radio.nextElementSibling?.querySelector('svg')).toHaveAttribute('width', '9');
  });

  it('manages an uncontrolled value and shares one input name', () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        aria-label="Notification method"
        defaultValue="email"
        options={[...options]}
        onChange={onChange}
      />,
    );

    const email = screen.getByRole('radio', { name: 'Email' });
    const sms = screen.getByRole('radio', { name: 'SMS' });

    expect(email).toBeChecked();
    expect(sms).not.toBeChecked();
    expect(email).toHaveAttribute('name', sms.getAttribute('name'));

    fireEvent.click(sms);

    expect(sms).toBeChecked();
    expect(email).not.toBeChecked();
    expect(onChange).toHaveBeenCalledWith('sms');
    expect(screen.getByRole('radio', { name: 'None' })).toBeDisabled();
  });

  it('supports controlled numeric values and group-level settings', () => {
    const onChange = vi.fn();
    const numericOptions = [
      { value: 1, label: 'One' },
      { value: 2, label: 'Two' },
    ];
    const { rerender } = render(
      <RadioGroup
        aria-label="Quantity"
        direction="horizontal"
        name="quantity"
        value={1}
        options={numericOptions}
        required
        onChange={onChange}
      />,
    );

    const group = screen.getByRole('radiogroup', { name: 'Quantity' });
    const one = screen.getByRole('radio', { name: 'One' });
    const two = screen.getByRole('radio', { name: 'Two' });

    expect(group).toHaveClass('flex-row');
    expect(one).toBeChecked();
    expect(one).toHaveAttribute('name', 'quantity');
    expect(one).toBeRequired();

    fireEvent.click(two);
    expect(onChange).toHaveBeenCalledWith(2);
    expect(one).toBeChecked();

    rerender(
      <RadioGroup
        aria-label="Quantity"
        direction="horizontal"
        name="quantity"
        value={2}
        options={numericOptions}
        required
        onChange={onChange}
      />,
    );
    expect(two).toBeChecked();
  });

  it('disables every option from the group', () => {
    render(
      <RadioGroup aria-label="Disabled group" options={[...options]} disabled />,
    );

    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getAllByRole('radio')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ disabled: true }),
        expect.objectContaining({ disabled: true }),
        expect.objectContaining({ disabled: true }),
      ]),
    );
  });
});
