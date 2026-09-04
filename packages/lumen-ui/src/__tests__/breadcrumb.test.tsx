import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Breadcrumb } from '../components/breadcrumb/Breadcrumb';

describe('Breadcrumb', () => {
  it('renders links, actions, disabled items, and the current page semantically', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <Breadcrumb
        aria-label="Page path"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Projects', onClick: onNavigate },
          { label: 'Archive', disabled: true },
          { label: 'Lumen' },
        ]}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Page path' })).toHaveAttribute(
      'data-ui',
      'breadcrumb',
    );
    expect(screen.getByRole('navigation', { name: 'Page path' })).toHaveClass(
      'text-[14px]',
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass(
      'text-[var(--lumen-color-text-placeholder)]',
    );
    await user.click(screen.getByRole('button', { name: 'Projects' }));
    expect(onNavigate).toHaveBeenCalledOnce();
    expect(screen.getByText('Archive').closest('[aria-disabled]')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByText('Lumen').closest('[aria-current]')).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('Lumen').closest('[aria-current]')).not.toHaveClass(
      'font-medium',
    );
  });
});
