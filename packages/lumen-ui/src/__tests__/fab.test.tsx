import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Plus } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { Fab } from '../components/Fab';

describe('Fab', () => {
  it('renders an accessible icon FAB and handles activation', () => {
    const onClick = vi.fn();
    render(
      <Fab
        icon={<Plus aria-hidden="true" />}
        aria-label="Create task"
        onClick={onClick}
      />,
    );

    const fab = screen.getByRole('button', { name: 'Create task' });
    expect(fab).toHaveAttribute('data-fab', 'icon');
    expect(fab).toHaveAttribute('data-position', 'fixed');
    expect(fab).toHaveClass('!h-14', '!w-14', '!rounded-full');
    expect(fab).toHaveStyle({ bottom: 'calc(16px + env(safe-area-inset-bottom))' });

    fireEvent.click(fab);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('supports extended and loading states', () => {
    render(<Fab icon={<Plus />} label="Create task" loading position="static" />);

    const fab = screen.getByRole('button', { name: '加载中' });
    expect(fab).toHaveAttribute('data-fab', 'extended');
    expect(fab).toHaveAttribute('aria-busy', 'true');
    expect(fab).toBeDisabled();
    expect(fab).toHaveClass('!rounded-[var(--lumen-radius-pill)]');
  });

  it('lets the layout control visibility and bottom offset', () => {
    const { rerender } = render(
      <Fab icon={<Plus />} aria-label="Create" active={false} />,
    );
    expect(screen.getByRole('button', { hidden: true })).not.toBeVisible();

    rerender(
      <Fab
        icon={<Plus />}
        aria-label="Create"
        active
        position="absolute"
        offset={80}
        safeArea={false}
      />,
    );
    expect(screen.getByRole('button', { name: 'Create' })).toHaveStyle({ bottom: '80px' });
  });
});
