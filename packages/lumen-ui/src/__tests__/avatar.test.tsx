import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from '../components/Avatar';

describe('Avatar', () => {
  it('renders initials with the requested shape and size', () => {
    render(<Avatar name="Ada Lovelace" shape="rounded" size="lg" />);

    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(avatar).toHaveTextContent('AL');
    expect(avatar).toHaveClass('rounded-[var(--lumen-radius-icon)]');
    expect(avatar).toHaveClass('h-10', 'w-10');
  });

  it('falls back when the image cannot load', () => {
    render(<Avatar src="/missing.png" alt="User profile" fallback="UP" />);

    fireEvent.error(document.querySelector('img')!);

    expect(screen.getByRole('img', { name: 'User profile' })).toHaveTextContent(
      'UP',
    );
  });
});
