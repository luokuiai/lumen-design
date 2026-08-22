import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Steps } from '../components/Steps';

const items = [
  { title: '创建事件' },
  { title: '现场处置' },
  { title: '完成归档', disabled: true },
];

describe('Steps', () => {
  it('derives statuses from the current step', () => {
    render(<Steps current={1} items={items} />);

    const steps = screen.getAllByRole('listitem');
    expect(steps[0]).toHaveAttribute('data-status', 'finish');
    expect(steps[1]).toHaveAttribute('data-status', 'process');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[2]).toHaveAttribute('data-status', 'wait');
  });

  it('supports interactive steps while respecting disabled items', () => {
    const onChange = vi.fn();
    render(<Steps current={0} items={items} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '现场处置' }));
    expect(onChange).toHaveBeenCalledWith(1, items[1]);
    expect(screen.queryByRole('button', { name: '完成归档' })).not.toBeInTheDocument();
  });
});
