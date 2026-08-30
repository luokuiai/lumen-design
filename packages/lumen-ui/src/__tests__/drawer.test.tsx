import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Drawer } from '../components/Drawer';

afterEach(() => {
  vi.useRealTimers();
});

describe('Drawer', () => {
  it('opens from the left when requested', () => {
    render(
      <Drawer open placement="left" drawerId="navigation" onRequestClose={() => undefined}>
        Navigation
      </Drawer>,
    );

    const panel = screen.getByText('Navigation').closest('aside');
    expect(panel).toHaveAttribute('data-drawer-placement', 'left');
    expect(panel).toHaveAttribute('data-drawer-state', 'open');
    expect(panel).toHaveClass('lumen-drawer-panel');
    expect(panel?.parentElement).toHaveClass('justify-start');
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
    expect(panel?.parentElement).toHaveAttribute('data-drawer-state', 'closing');

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
