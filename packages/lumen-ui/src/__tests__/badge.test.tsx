import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../components/Badge';

describe('Badge', () => {
  it('renders the default variant with a visible tinted background', () => {
    render(<Badge>Default</Badge>);

    expect(screen.getByText('Default')).toHaveClass(
      'h-[26px]',
      'text-[13px]',
      'bg-[var(--lumen-color-primary-soft-hover)]',
      'text-[var(--lumen-color-primary-hover)]',
    );
  });

  it.each([
    ['info', 'bg-[var(--lumen-color-primary-soft-hover)]'],
    ['success', 'bg-[var(--lumen-color-success-soft)]'],
    ['warning', 'bg-[var(--lumen-color-warning-soft)]'],
    ['danger', 'bg-[var(--lumen-color-danger-soft)]'],
    ['neutral', 'bg-[var(--lumen-color-surface-muted)]'],
  ] as const)('renders the %s semantic color', (variant, backgroundClass) => {
    render(<Badge variant={variant}>{variant}</Badge>);

    expect(screen.getByText(variant)).toHaveClass(backgroundClass);
  });

  it('keeps the outline variant on a surface background', () => {
    render(<Badge variant="outline">Outline</Badge>);

    expect(screen.getByText('Outline')).toHaveClass(
      'border-[var(--lumen-color-border-hover)]',
      'bg-[var(--lumen-color-surface)]',
    );
  });
});
