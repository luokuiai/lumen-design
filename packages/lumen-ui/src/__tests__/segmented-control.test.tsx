import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from '../components/SegmentedControl';

describe('SegmentedControl', () => {
  it('reports the selected option and changes value', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="Chart period"
        value="day"
        options={[
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ]}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('button', { name: 'Day' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(onChange).toHaveBeenCalledWith('week');
  });

  it('does not activate a disabled option', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        value="day"
        options={[
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week', disabled: true },
        ]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('aligns its medium size with other medium controls', () => {
    render(
      <SegmentedControl
        size="md"
        value="day"
        options={[{ label: 'Day', value: 'day' }]}
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole('button', { name: 'Day' })).toHaveClass(
      'h-[var(--lumen-control-height-md)]',
      'px-4',
      'text-[14px]',
      'font-normal',
    );
  });
});
