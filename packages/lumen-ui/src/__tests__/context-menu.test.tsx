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

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('ContextMenu', () => {
  it.each([
    { right: false, bottom: false },
    { right: true, bottom: false },
    { right: false, bottom: true },
    { right: true, bottom: true },
  ])('anchors opening and closing to the pointer (right=$right, bottom=$bottom)', ({ right, bottom }) => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(160);
    render(<Example />);
    const x = right ? window.innerWidth - 20 : 120;
    const y = bottom ? window.innerHeight - 20 : 140;
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Target' }), {
      clientX: x,
      clientY: y,
    });
    const menu = screen.getByRole('menu', { name: 'Actions' });
    expect(menu).toHaveStyle({ left: `${right ? x - 200 : x}px`, top: `${bottom ? y - 160 : y}px` });
    const surface = menu.querySelector('[data-ui="context-menu"]');
    const transformOrigin = `${right ? 200 : 0}px ${bottom ? 160 : 0}px`;
    expect(surface).toHaveStyle({
      transformOrigin,
      animation: `lumen-dropdown-in${bottom ? '-up' : ''} 0.12s ease-out`,
    });
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(surface).toHaveStyle({
      transformOrigin,
      animation: `lumen-dropdown-out${bottom ? '-up' : ''} 0.12s ease-in forwards`,
    });
  });

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
