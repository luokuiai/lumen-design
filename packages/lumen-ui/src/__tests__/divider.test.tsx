import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Divider } from '../components/Divider';

describe('Divider', () => {
  it('renders a horizontal separator with a label', () => {
    render(<Divider label="更多信息" variant="dashed" />);

    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    expect(divider).toHaveTextContent('更多信息');
    expect(divider.querySelector('.border-dashed')).toBeInTheDocument();
    expect(divider.querySelector('.border-dashed')?.className).toContain(
      '--lumen-color-divider',
    );
  });

  it('renders a vertical separator', () => {
    render(<Divider orientation="vertical" />);

    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    expect(screen.getByRole('separator').className).toContain('--lumen-color-divider');
  });
});
