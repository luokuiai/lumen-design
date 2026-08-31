import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Typography, typographyVariantClassNames } from '../components/Typography';

describe('Typography', () => {
  it.each([
    ['h1', '22px', 'leading-[30px]', 'font-medium'],
    ['h2', '20px', 'leading-7', 'font-medium'],
    ['h3', '18px', 'leading-[26px]', 'font-medium'],
    ['h4', '16px', 'leading-6', 'font-medium'],
    ['h5', '15px', 'leading-[22px]', 'font-medium'],
    ['h6', '14px', 'leading-5', 'font-medium'],
  ] as const)('renders %s with its semantic heading scale', (variant, size, lineHeight, weight) => {
    render(<Typography variant={variant}>{variant}</Typography>);

    const heading = screen.getByRole('heading', { level: Number(variant.slice(1)) });
    expect(heading.tagName).toBe(variant.toUpperCase());
    expect(heading).toHaveClass(
      `text-[${size}]`,
      lineHeight,
      weight,
      'text-[var(--lumen-color-text-strong)]',
    );
  });

  it('defines regular-weight body scales and supports semantic overrides', () => {
    render(
      <Typography variant="body-sm" tone="muted" as="span">
        辅助信息
      </Typography>,
    );

    expect(screen.getByText('辅助信息')).toHaveClass(
      'text-[13px]',
      'leading-5',
      'font-normal',
      'text-[var(--lumen-color-text-muted)]',
    );
    expect(screen.getByText('辅助信息').tagName).toBe('SPAN');
    expect(typographyVariantClassNames.caption).toContain('text-[12px]');
  });
});
