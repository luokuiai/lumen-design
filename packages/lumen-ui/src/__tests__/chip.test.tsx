import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Chip } from '../components/Chip';

describe('Chip', () => {
  it('renders semantic and selected states', () => {
    render(
      <Chip tone="warning" selected shape="pill" onSelect={() => undefined}>
        重点关注
      </Chip>,
    );

    expect(screen.getByText('重点关注').closest('[data-ui="chip"]')).toHaveClass(
      'bg-[var(--lumen-color-warning-soft)]',
      'text-[13px]',
      'ring-1',
      'rounded-full',
    );
  });

  it('keeps selection and close actions independent', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <Chip onSelect={onSelect} onClose={onClose} closeLabel="移除重点标签">
        重点
      </Chip>,
    );

    fireEvent.click(screen.getByRole('button', { name: '重点' }));
    expect(onSelect).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: '移除重点标签' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
