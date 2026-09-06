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
    expect(fab).toHaveClass('!h-9', '!w-9', '!rounded-full', '!border-0');
    expect(fab).toHaveClass('shadow-[0_3px_10px_var(--lumen-color-shadow)]');
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

  it('supports custom background and foreground colors', () => {
    render(
      <Fab
        position="static"
        icon={<Plus />}
        aria-label="Create"
        color="#7c3aed"
        foregroundColor="#ffffff"
      />,
    );

    expect(screen.getByRole('button', { name: 'Create' })).toHaveStyle({
      backgroundColor: '#7c3aed',
      color: '#ffffff',
    });
  });

  it('can collapse an extended action to an icon', () => {
    const { rerender } = render(
      <Fab icon={<Plus />} label="Create task" extended position="static" />,
    );
    expect(screen.getByRole('button', { name: 'Create task' })).toHaveAttribute('data-fab', 'extended');

    rerender(<Fab icon={<Plus />} label="Create task" extended={false} position="static" />);
    expect(screen.getByRole('button', { name: 'Create task' })).toHaveAttribute('data-fab', 'icon');
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

  it('expands child actions and closes after an action is selected', () => {
    const onActionClick = vi.fn();
    render(
      <Fab
        position="static"
        icon={<Plus />}
        aria-label="Create"
        actions={[
          { icon: <Plus />, label: 'Create task', onClick: onActionClick },
          { icon: <Plus />, label: 'Create note' },
        ]}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Create' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('group', { name: 'Create' })).toBeVisible();
    expect(trigger.querySelector('.lucide-plus')).toBeInTheDocument();
    expect(trigger).toHaveClass('[&>span:first-child]:rotate-45');

    const childAction = screen.getByRole('button', { name: 'Create task' });
    expect(childAction).toHaveAttribute('data-fab', 'icon');
    expect(childAction).toHaveClass('scale-100', 'opacity-100', '!rounded-full');

    fireEvent.click(childAction);
    expect(onActionClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole('group', { name: 'Create' })).not.toBeInTheDocument();
    expect(childAction).toHaveClass('scale-50', 'opacity-0');
  });

  it('supports controlled submenu state', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Fab
        position="static"
        icon={<Plus />}
        aria-label="Create"
        actions={[{ icon: <Plus />, label: 'Create task' }]}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('group', { name: 'Create' })).not.toBeInTheDocument();

    rerender(
      <Fab
        position="static"
        icon={<Plus />}
        aria-label="Create"
        actions={[{ icon: <Plus />, label: 'Create task' }]}
        open
        onOpenChange={onOpenChange}
      />,
    );
    expect(screen.getByRole('group', { name: 'Create' })).toBeVisible();
  });

  it('closes an open submenu on outside interaction or Escape', () => {
    render(
      <Fab
        position="static"
        icon={<Plus />}
        aria-label="Create"
        defaultOpen
        actions={[{ icon: <Plus />, label: 'Create task' }]}
      />,
    );

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('group', { name: 'Create' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('group', { name: 'Create' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toHaveFocus();
  });
});
