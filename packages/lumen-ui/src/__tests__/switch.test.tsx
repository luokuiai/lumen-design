import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Switch } from '../components/Switch';

describe('Switch', () => {
  it.each([
    { size: 'sm' as const, track: ['h-4', 'w-7'], knob: ['h-3', 'w-3', 'translate-x-3'] },
    { size: 'md' as const, track: ['h-[18px]', 'w-8'], knob: ['h-3.5', 'w-3.5', 'translate-x-3.5'] },
    { size: 'lg' as const, track: ['h-5', 'w-9'], knob: ['h-4', 'w-4', 'translate-x-4'] },
  ])('renders the $size size', ({ size, track: trackClasses, knob: knobClasses }) => {
    render(<Switch size={size} checked aria-label={size} />);

    const input = screen.getByRole('switch', { name: size });
    const track = input.closest('[data-switch-track]');
    const knob = track?.querySelector('[data-switch-knob]');

    expect(track).toHaveClass(...trackClasses);
    expect(knob).toHaveClass(...knobClasses);
  });
});
