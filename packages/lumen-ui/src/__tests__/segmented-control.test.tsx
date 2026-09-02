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

  it('uses the medium control size by default', () => {
    render(
      <SegmentedControl
        value="day"
        options={[{ label: 'Day', value: 'day' }]}
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole('group')).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('group')).toHaveClass(
      'h-[var(--lumen-control-height-md)]',
    );
    expect(screen.getByRole('button', { name: 'Day' })).toHaveClass(
      'h-full',
      'px-4',
      'text-[14px]',
      'font-normal',
    );
  });

  it('supports a compact small size', () => {
    render(
      <SegmentedControl
        size="sm"
        value="day"
        options={[{ label: 'Day', value: 'day' }]}
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole('group')).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('group')).toHaveClass(
      'h-[var(--lumen-control-height-sm)]',
    );
    expect(screen.getByRole('button', { name: 'Day' })).toHaveClass(
      'h-full',
      'px-3',
      'text-[13px]',
    );
  });
});
