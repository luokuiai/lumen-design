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
});
