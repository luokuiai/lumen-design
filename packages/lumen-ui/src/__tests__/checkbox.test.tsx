import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../components/Checkbox';

describe('Checkbox', () => {
  it.each([
    { size: 'sm' as const, control: ['h-3.5', 'w-3.5'], icon: '9' },
    { size: 'md' as const, control: ['h-4', 'w-4'], icon: '11' },
    { size: 'lg' as const, control: ['h-[18px]', 'w-[18px]'], icon: '13' },
  ])('renders the $size size', ({ size, control, icon }) => {
    render(<Checkbox size={size} checked label={size} />);

    const checkbox = screen.getByRole('checkbox', { name: size });
    expect(checkbox.parentElement).toHaveClass(...control);
    expect(checkbox.nextElementSibling).toHaveClass(...control);
    expect(checkbox.nextElementSibling?.querySelector('svg')).toHaveAttribute('width', icon);
  });

  it('uses medium by default', () => {
    render(<Checkbox checked aria-label="Default" />);

    expect(screen.getByRole('checkbox', { name: 'Default' }).parentElement).toHaveClass('h-4', 'w-4');
  });
});
