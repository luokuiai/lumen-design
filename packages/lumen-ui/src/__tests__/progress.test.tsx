import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from '../components/Progress';

describe('Progress', () => {
  it('renders a normalized line progress value', () => {
    render(<Progress label="处置进度" value={35} max={50} showValue />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '35');
    expect(progress).toHaveAttribute('aria-valuemax', '50');
    expect(progress).toHaveTextContent('70%');
    expect(progress.querySelector('[style*="width: 70%"]')).toBeInTheDocument();
  });

  it('clamps values and supports circular progress', () => {
    render(<Progress type="circle" value={140} showValue status="success" />);

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '100');
    expect(progress).toHaveTextContent('100%');
    expect(progress).toHaveAttribute('data-type', 'circle');
  });

  it('omits a numeric value while indeterminate', () => {
    render(<Progress indeterminate label="正在加载" />);

    const progress = screen.getByRole('progressbar');
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress).toHaveAttribute('aria-valuetext', '加载中');
  });
});
