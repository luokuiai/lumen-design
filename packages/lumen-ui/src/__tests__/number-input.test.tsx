import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NumberInput } from '../components/number-input/NumberInput';

describe('NumberInput', () => {
  it('supports native number attributes, typing, and bounded step controls', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberInput
        aria-label="Quantity"
        defaultValue={2}
        min={1}
        max={3}
        step={0.5}
        suffix="items"
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByRole('spinbutton', { name: 'Quantity' });
    expect(input).toHaveAttribute('type', 'number');
    expect(screen.getByText('items')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '增加' }));
    expect(input).toHaveValue(2.5);
    expect(onValueChange).toHaveBeenLastCalledWith(2.5);

    await user.click(screen.getByRole('button', { name: '增加' }));
    expect(input).toHaveValue(3);
    expect(screen.getByRole('button', { name: '增加' })).toBeDisabled();

    await user.clear(input);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });
});
