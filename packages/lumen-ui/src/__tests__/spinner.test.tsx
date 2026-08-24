import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from '../components/Spinner';

describe('Spinner', () => {
  it('renders an accessible default loading state', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveTextContent('加载中');
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass('animate-spin');
  });

  it('supports labels, sizes, and tones', () => {
    render(<Spinner size="lg" tone="warning" label="正在同步" />);

    expect(screen.getByRole('status')).toHaveTextContent('正在同步');
    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('status')).toHaveClass('text-[var(--lumen-color-warning)]');
  });
});
