import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContextMenu } from '../components/context-menu/ContextMenu';

const pointerEvent = (type: string, pointerType: 'touch' | 'mouse') => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: 72 },
    clientY: { value: 96 },
    isPrimary: { value: true },
    pointerId: { value: 1 },
    pointerType: { value: pointerType },
  });
  return event;
};

const Example = ({ disabled = false }: { disabled?: boolean }) => (
  <ContextMenu
    disabled={disabled}
    ariaLabel="Actions"
    content={(
      <>
        <button type="button" role="menuitem">Copy</button>
        <button type="button" role="menuitem">Delete</button>
      </>
    )}
  >
    <button type="button">Target</button>
  </ContextMenu>
);

afterEach(() => vi.useRealTimers());

describe('ContextMenu', () => {
  it('opens at the pointer on desktop context menu', () => {
    render(<Example />);
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Target' }), {
      clientX: 120,
      clientY: 140,
    });

    const menu = screen.getByRole('menu', { name: 'Actions' });
    expect(menu).toHaveStyle({ left: '120px', top: '140px' });
    expect(menu).toHaveFocus();
    expect(screen.getByRole('menuitem', { name: 'Copy' })).not.toHaveFocus();

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Copy' })).toHaveFocus();
  });

  it('opens from a mobile long press', () => {
    vi.useFakeTimers();
    render(<Example />);
    const target = screen.getByRole('button', { name: 'Target' });

    fireEvent(target, pointerEvent('pointerdown', 'touch'));
    act(() => vi.advanceTimersByTime(500));

    expect(screen.getByRole('menu', { name: 'Actions' })).toBeInTheDocument();
  });

  it('does not treat a desktop mouse press as a long press', () => {
    vi.useFakeTimers();
    render(<Example />);
    fireEvent(screen.getByRole('button', { name: 'Target' }), pointerEvent('pointerdown', 'mouse'));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes after selecting an enabled item', () => {
    vi.useFakeTimers();
    render(<Example />);
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Target' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
    act(() => vi.advanceTimersByTime(120));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not open while disabled', () => {
    render(<Example disabled />);
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Target' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
