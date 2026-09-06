import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppHeader } from '../components/AppHeader';

describe('AppHeader', () => {
  it('renders navigation, heading, search, and action slots', () => {
    render(
      <AppHeader
        data-testid="app-header"
        className="custom-header"
        navigation={<button type="button">Menu</button>}
        title="Operations"
        description="Monitor active work"
        search={<input type="search" aria-label="Search" />}
        actions={<button type="button">Notifications</button>}
      />,
    );

    const header = screen.getByTestId('app-header');
    expect(header.tagName).toBe('HEADER');
    expect(header).toHaveAttribute('data-ui', 'app-header');
    expect(header).toHaveClass('custom-header');
    expect(screen.getByRole('heading', { name: 'Operations', level: 1 })).toHaveClass(
      'text-[20px]',
      'font-medium',
    );
    expect(screen.getByText('Monitor active work')).toHaveClass('text-[12px]');
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('omits optional regions when no slot content is provided', () => {
    const { container } = render(<AppHeader title="Operations" />);

    expect(container.querySelector('[data-ui="app-header-navigation"]')).toBeNull();
    expect(container.querySelector('[data-ui="app-header-end"]')).toBeNull();
  });
});
