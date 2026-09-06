import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

  it('creates and clears a ripple from pointer input', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 40,
      left: 10,
      top: 20,
      right: 110,
      bottom: 60,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(button, { clientX: 30, clientY: 40 });
    const ripple = button.querySelector('[data-button-ripple]');
    expect(ripple).toBeInTheDocument();

    fireEvent.animationEnd(ripple!);
    expect(button.querySelector('[data-button-ripple]')).not.toBeInTheDocument();
  });

  it('creates a centered ripple for keyboard activation', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(button.querySelector('[data-button-ripple]')).toBeInTheDocument();
  });
});
