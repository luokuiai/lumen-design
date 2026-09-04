import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Bell, Home, UserRound } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { BottomNavigation } from '../components/BottomNavigation';

const items = [
  { value: 'home', label: 'Home', icon: Home, href: '#home' },
  {
    value: 'messages',
    label: 'Messages',
    icon: Bell,
    badge: 3,
    badgeLabel: '3 unread messages',
  },
  { value: 'profile', label: 'Profile', icon: UserRound, disabled: true },
] as const;

describe('BottomNavigation', () => {
  it('marks the current destination and reports selections', () => {
    const onChange = vi.fn();
    render(
      <BottomNavigation
        ariaLabel="Primary navigation"
        items={items}
        value="home"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toHaveAttribute(
      'data-position',
      'fixed',
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    fireEvent.click(screen.getByRole('button', { name: /Messages/ }));
    expect(onChange).toHaveBeenCalledWith('messages', items[1]);
    expect(screen.getByText('3 unread messages')).toHaveClass('sr-only');
  });

  it('does not select disabled destinations', () => {
    const onChange = vi.fn();
    render(<BottomNavigation items={items} value="home" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
    expect(screen.getByRole('button', { name: 'Profile' })).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('lets the layout control visibility and positioning', () => {
    const { rerender } = render(
      <BottomNavigation items={items} value="home" active={false} />,
    );

    expect(screen.getByRole('navigation', { hidden: true })).not.toBeVisible();

    rerender(
      <BottomNavigation
        items={items}
        value="home"
        active
        position="absolute"
        safeArea={false}
      />,
    );

    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeVisible();
    expect(navigation).toHaveAttribute('data-position', 'absolute');
    expect(navigation).not.toHaveClass('pb-[env(safe-area-inset-bottom)]');
  });
});
