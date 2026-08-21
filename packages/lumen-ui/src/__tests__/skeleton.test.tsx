import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '../components/Skeleton';

describe('Skeleton', () => {
  it('renders an animated text placeholder by default', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstElementChild;

    expect(skeleton).toHaveClass('lumen-skeleton', 'h-4', 'w-full');
    expect(skeleton).toHaveAttribute('data-animation', 'pulse');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports shape, dimensions, custom attributes, and refs', () => {
    const ref = createRef<HTMLSpanElement>();

    render(
      <Skeleton
        ref={ref}
        variant="circular"
        animation="none"
        width={48}
        height="3rem"
        aria-hidden={false}
        aria-label="Loading avatar"
        className="avatar-placeholder"
      />,
    );

    const skeleton = screen.getByLabelText('Loading avatar');
    expect(skeleton).toBe(ref.current);
    expect(skeleton).toHaveClass('rounded-full', 'avatar-placeholder');
    expect(skeleton).toHaveStyle({ width: '48px', height: '3rem' });
    expect(skeleton).toHaveAttribute('data-animation', 'none');
    expect(skeleton).not.toHaveAttribute('data-lumen-motion');
  });
});
