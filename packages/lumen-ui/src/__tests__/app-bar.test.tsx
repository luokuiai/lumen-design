import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppBar } from '../components/AppBar';
import { Button } from '../components/Button';

describe('AppBar', () => {
  it('renders application navigation content through a toolbar', () => {
    render(
      <AppBar
        title="Order details"
        leading={<Button iconOnly aria-label="Back" icon={<span aria-hidden="true">←</span>} />}
        actions={<Button iconOnly aria-label="More" icon={<span aria-hidden="true">...</span>} />}
        ariaLabel="Order navigation"
      />,
    );

    const appBar = screen.getByRole('banner');
    expect(appBar).toHaveAttribute('data-position', 'fixed');
    expect(appBar).toHaveAttribute('data-title-align', 'center');
    expect(screen.getByRole('toolbar', { name: 'Order navigation' })).toHaveClass(
      '[&_[data-icon-only]]:!rounded-full',
    );
    expect(screen.getByRole('heading', { name: 'Order details', level: 1 })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Back' })).toHaveAttribute('data-icon-only', 'true');
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('data-icon-only', 'true');
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
