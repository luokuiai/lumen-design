import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs } from '../components/Tabs';

const options = [
  { label: 'Overview', value: 'overview' },
  { label: 'Activity', value: 'activity' },
];

describe('Tabs', () => {
  it('uses the line treatment by default', () => {
    render(
      <Tabs value="overview" options={options} onChange={() => undefined} />,
    );

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass(
      'after:bg-[var(--lumen-color-primary)]',
      'after:bottom-0',
      'after:h-[2px]',
    );
    expect(screen.getByRole('tablist')).toHaveClass(
      'overflow-x-auto',
      'overflow-y-hidden',
    );
  });

  it('keeps the pill variant available', () => {
    render(
      <Tabs
        value="overview"
        options={options}
        variant="pill"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveClass(
      'rounded-full',
    );
  });
});
