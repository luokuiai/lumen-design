import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from '../components/command-palette/CommandPalette';

const groups = [
  {
    heading: 'Navigation',
    items: [
      { id: 'home', label: 'Home', keywords: ['start'], onSelect: vi.fn() },
      { id: 'settings', label: 'Settings', description: 'Manage preferences', onSelect: vi.fn() },
      { id: 'disabled', label: 'Disabled command', disabled: true, onSelect: vi.fn() },
    ],
  },
];

describe('CommandPalette', () => {
  it('filters commands and selects the active result with the keyboard', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CommandPalette open onOpenChange={onOpenChange} groups={groups} label="Quick actions" />);

    expect(screen.getByRole('dialog', { name: 'Quick actions' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    expect(document.querySelector('[data-ui="command-palette"]')).toHaveClass(
      'bg-[var(--lumen-color-surface)]',
    );
    expect(screen.getByRole('option', { name: 'Home' })).toHaveClass(
      'bg-[var(--lumen-color-surface-hover)]',
    );
    expect(screen.getByRole('listbox', { name: 'Quick actions' })).toHaveAttribute(
      'data-ui',
      'scrollbar',
    );
    const input = screen.getByRole('combobox', { name: '搜索命令...' });
    await user.type(input, 'preferences');
    expect(screen.queryByRole('option', { name: 'Home' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Settings/ })).toBeVisible();

    await user.keyboard('{Enter}');
    expect(groups[0]!.items[1]!.onSelect).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('opens with the global shortcut and skips disabled commands', async () => {
    const user = userEvent.setup();
    const firstAction = vi.fn();
    const lastAction = vi.fn();

    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          enableShortcut
          groups={[{ items: [
            { id: 'first', label: 'First', onSelect: firstAction },
            { id: 'disabled', label: 'Disabled', disabled: true, onSelect: vi.fn() },
            { id: 'last', label: 'Last', onSelect: lastAction },
          ] }]}
        />
      );
    };

    render(<Harness />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog', { name: '命令面板' })).toBeVisible();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(firstAction).not.toHaveBeenCalled();
    expect(lastAction).toHaveBeenCalledOnce();
  });
});
