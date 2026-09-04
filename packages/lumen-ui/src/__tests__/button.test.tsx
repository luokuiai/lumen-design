import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../components/Button';

describe('Button', () => {
  it('exposes stable theme hooks for its variant and size', () => {
    render(<Button variant="accent" size="lg">Create</Button>);

    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute(
      'data-ui',
      'button',
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute(
      'data-variant',
      'accent',
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute(
      'data-size',
      'lg',
    );
  });

  it('renders an accessible square button in icon-only mode', () => {
    render(<Button iconOnly aria-label="Search" icon={<span>icon</span>} />);

    expect(screen.getByRole('button', { name: 'Search' })).toHaveClass('h-9', 'w-9');
    expect(screen.queryByText('icon')).toBeInTheDocument();
  });
});
