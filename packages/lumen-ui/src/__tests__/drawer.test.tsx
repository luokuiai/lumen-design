import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Drawer } from '../components/Drawer';

const touchPointerEvent = (
  type: string,
  coordinates: { clientX: number; clientY: number },
) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientX: { value: coordinates.clientX },
    clientY: { value: coordinates.clientY },
    pointerId: { value: 1 },
    pointerType: { value: 'touch' },
  });
  return event;
};

afterEach(() => {
  vi.useRealTimers();
});

describe('Drawer', () => {
  it('opens from the left when requested', () => {
    render(
      <Drawer
        open
        placement="left"
        drawerId="navigation"
        onRequestClose={() => undefined}
      >
        Navigation
      </Drawer>,
    );

    const panel = screen.getByText('Navigation').closest('aside');
    expect(panel).toHaveAttribute('data-drawer-placement', 'left');
    expect(panel).toHaveAttribute('data-drawer-state', 'open');
    expect(panel).toHaveClass('lumen-drawer-panel');
    expect(panel?.parentElement).toHaveClass('justify-start');
    expect(panel).toHaveAttribute('role', 'dialog');
    expect(panel).toHaveAttribute('aria-modal', 'true');
    expect(panel?.parentElement).toHaveStyle({ height: '100dvh' });
  });

  it('supports an accessible name and Escape dismissal', () => {
    const onRequestClose = vi.fn();
    render(
      <Drawer open aria-label="Navigation menu" onRequestClose={onRequestClose}>
        Navigation
      </Drawer>,
    );

    expect(
      screen.getByRole('dialog', { name: 'Navigation menu' }),
    ).toBeVisible();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onRequestClose).toHaveBeenCalledOnce();
  });

  it('renders and automatically associates its title and description', () => {
    render(
      <Drawer
        open
        title="Filters"
        description="Narrow the visible results."
        onRequestClose={() => undefined}
      >
        Filter controls
      </Drawer>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveAccessibleDescription('Narrow the visible results.');
    expect(document.querySelector('[data-drawer-title]')).toHaveTextContent(
      'Filters',
    );
  });

  it('closes when a touch drag crosses the dismissal threshold', () => {
    const onRequestClose = vi.fn();
    render(
      <Drawer
        open
        closeOnSwipe
        aria-label="Filters"
        onRequestClose={onRequestClose}
      >
        Filters
      </Drawer>,
    );

    const panel = screen.getByRole('dialog', { name: 'Filters' });
    fireEvent(
      panel,
      touchPointerEvent('pointerdown', { clientX: 100, clientY: 100 }),
    );
    fireEvent(
      panel,
      touchPointerEvent('pointermove', { clientX: 220, clientY: 105 }),
    );
    expect(panel).toHaveAttribute('data-drawer-dragging', 'true');
    fireEvent(
      panel,
      touchPointerEvent('pointerup', { clientX: 220, clientY: 105 }),
    );

    expect(onRequestClose).toHaveBeenCalledOnce();
  });

  it('does not treat a pointer gesture starting in the panel as an overlay click', () => {
    const onRequestClose = vi.fn();
    render(
      <Drawer open drawerId="drag-safe" onRequestClose={onRequestClose}>
        Content
      </Drawer>,
    );

    const panel = document.querySelector('[data-drawer="drag-safe"]')!;
    const overlay = document.querySelector(
      '[data-drawer-overlay="drag-safe"]',
    )!;
    fireEvent.pointerDown(panel);
    fireEvent.click(overlay);

    expect(onRequestClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);
    expect(onRequestClose).toHaveBeenCalledOnce();
  });

  it('waits for the panel slide-out animation before unmounting', () => {
    const onExited = vi.fn();
    const { rerender } = render(
      <Drawer
        open
        placement="left"
        drawerId="closing-navigation"
        onRequestClose={() => undefined}
        onExited={onExited}
      >
        Navigation content
      </Drawer>,
    );

    rerender(
      <Drawer
        open={false}
        placement="left"
        drawerId="closing-navigation"
        onRequestClose={() => undefined}
        onExited={onExited}
      >
        {null}
      </Drawer>,
    );

    const panel = screen.getByText('Navigation content').closest('aside');
    expect(panel).toHaveAttribute('data-drawer-state', 'closing');
    expect(panel?.parentElement).toHaveAttribute(
      'data-drawer-state',
      'closing',
    );

    fireEvent.animationEnd(panel!);

    expect(screen.queryByText('Navigation content')).not.toBeInTheDocument();
    expect(onExited).toHaveBeenCalledOnce();
  });

  it('unmounts even when the browser does not emit animationend', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Drawer open drawerId="fallback" onRequestClose={() => undefined}>
        Fallback content
      </Drawer>,
    );

    rerender(
      <Drawer open={false} drawerId="fallback" onRequestClose={() => undefined}>
        {null}
      </Drawer>,
    );

    act(() => vi.advanceTimersByTime(309));
    expect(screen.getByText('Fallback content')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));

    expect(screen.queryByText('Fallback content')).not.toBeInTheDocument();
  });
});
