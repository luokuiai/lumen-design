import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppBar } from '../components/AppBar';

describe('AppBar', () => {
  it('renders application navigation content through a toolbar', () => {
    render(
      <AppBar
        title="Order details"
        leading={<button type="button">Back</button>}
        actions={<button type="button">More</button>}
        ariaLabel="Order navigation"
      />,
    );

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveAttribute('data-position', 'fixed');
    expect(appBar).toHaveAttribute('data-title-align', 'center');
    expect(screen.getByRole('toolbar', { name: 'Order navigation' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Order details', level: 1 })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Back' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'More' })).toBeVisible();
  });

  it('lets the layout control visibility, alignment, and positioning', () => {
    const { rerender } = render(<AppBar title="Inbox" active={false} />);
    expect(screen.getByRole('banner', { hidden: true })).not.toBeVisible();

    rerender(
      <AppBar
        title="Inbox"
        active
        position="sticky"
        titleAlign="start"
        safeArea={false}
      />,
    );

    const appBar = screen.getByRole('banner');
    expect(appBar).toBeVisible();
    expect(appBar).toHaveAttribute('data-position', 'sticky');
    expect(appBar).toHaveAttribute('data-title-align', 'start');
    expect(appBar).not.toHaveClass('pt-[env(safe-area-inset-top)]');
  });
});
