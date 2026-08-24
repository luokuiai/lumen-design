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
    const currentIndicator = steps[1]?.querySelector('[aria-hidden="true"]');
    expect(currentIndicator).toHaveClass('h-10', 'w-10');
    expect(currentIndicator?.className).not.toContain('shadow-');
    expect(currentIndicator?.firstElementChild).toHaveClass('h-8', 'w-8');
  });

  it('supports interactive steps while respecting disabled items', () => {
    const onChange = vi.fn();
    render(<Steps current={0} items={items} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '现场处置' }));
    expect(onChange).toHaveBeenCalledWith(1, items[1]);
    expect(screen.queryByRole('button', { name: '完成归档' })).not.toBeInTheDocument();
  });

  it('applies horizontal layout without a responsive breakpoint', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Steps direction="horizontal" items={items} onChange={onChange} />,
    );

    expect(screen.getByRole('list')).toHaveClass('flex-row', 'overflow-x-auto');
    expect(screen.getByRole('button', { name: '创建事件' })).toHaveClass('flex-col');
    expect(screen.getAllByRole('listitem')[0]).toHaveClass(
      'after:left-[calc(50%+24px)]',
      'after:right-[calc(-50%+20px)]',
    );

    rerender(<Steps direction="vertical" items={items} onChange={onChange} />);
    expect(screen.getByRole('list')).toHaveClass('flex-col');
    expect(screen.getByRole('button', { name: '创建事件' })).not.toHaveClass('flex-col');
    expect(screen.getAllByRole('listitem')[0]).toHaveClass(
      'after:bottom-[-16px]',
      'after:top-11',
    );
  });
});
