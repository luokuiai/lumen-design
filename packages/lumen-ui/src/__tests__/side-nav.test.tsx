import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Bell, Settings } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { SideNav } from '../components/SideNav';

const sections = [
  {
    title: 'Workspace',
    items: [
      { value: 'overview', label: 'Overview', icon: Bell, href: '#overview' },
      { value: 'settings', label: 'Settings', icon: Settings, disabled: true },
    ],
  },
];

describe('SideNav', () => {
  it('marks the active item and emits selections', () => {
    const onSelect = vi.fn();
    render(
      <SideNav
        sections={sections}
        activeValue="overview"
        ariaLabel="Workspace navigation"
        onSelect={onSelect}
      />,
    );

    const activeItem = screen.getByRole('link', { name: 'Overview' });
    expect(activeItem).toHaveAttribute('aria-current', 'page');
    expect(activeItem).toHaveClass('bg-[var(--lumen-color-primary-soft)]');

    fireEvent.click(activeItem);
    expect(onSelect).toHaveBeenCalledWith('overview', sections[0]!.items[0]!);
    expect(screen.getByRole('button', { name: 'Settings' })).toBeDisabled();
  });

  it('keeps collapsed items accessible by name', () => {
    render(<SideNav sections={sections} collapsed activeValue="overview" />);

    expect(screen.getByRole('navigation')).toHaveAttribute('data-collapsed', 'true');
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveClass('justify-center');
  });
});
