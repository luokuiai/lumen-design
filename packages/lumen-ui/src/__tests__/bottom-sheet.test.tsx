import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BottomSheet } from '../components/BottomSheet';

const touchPointerEvent = (type: string, clientY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientY: { value: clientY },
    pointerId: { value: 1 },
    pointerType: { value: 'touch' },
  });
  return event;
};

afterEach(() => {
  vi.useRealTimers();
});

describe('BottomSheet', () => {
  it('renders an accessible sheet at the viewport bottom', () => {
    render(
      <BottomSheet
        open
        title="Share"
        description="Choose a destination."
        sheetId="share"
        onRequestClose={() => undefined}
      >
        Sheet content
      </BottomSheet>,
    );

    const sheet = screen.getByRole('dialog', { name: 'Share' });
    expect(sheet).toHaveAccessibleDescription('Choose a destination.');
    expect(sheet).toHaveAttribute('data-bottom-sheet-state', 'open');
    expect(sheet).toHaveClass('lumen-bottom-sheet-panel', 'rounded-t-[16px]');
    expect(sheet.parentElement).toHaveClass('items-end');
    expect(sheet.parentElement).toHaveStyle({ height: '100dvh' });
    expect(document.querySelector('[data-bottom-sheet-handle]')).toBeVisible();
  });

  it('supports inset sizing and custom limits', () => {
    render(
      <BottomSheet
        open
        inset
        maxWidth={720}
        maxHeight="60dvh"
        aria-label="Player"
        onRequestClose={() => undefined}
      >
        Player
      </BottomSheet>,
    );

    const sheet = screen.getByRole('dialog', { name: 'Player' });
    expect(sheet).toHaveAttribute('data-bottom-sheet-inset', 'true');
    expect(sheet).toHaveClass('pad:w-[70%]');
    expect(sheet).toHaveStyle({ maxWidth: '720px', maxHeight: '60dvh' });
  });

  it('closes from the overlay, Escape, or a downward handle swipe', () => {
    const onRequestClose = vi.fn();
    render(
      <BottomSheet open aria-label="Actions" onRequestClose={onRequestClose}>
        Actions
      </BottomSheet>,
    );

    const overlay = document.querySelector('.lumen-bottom-sheet-overlay')!;
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);
    fireEvent.keyDown(document, { key: 'Escape' });

    const handle = document.querySelector('[data-bottom-sheet-handle]')!;
    fireEvent(handle, touchPointerEvent('pointerdown', 100));
    fireEvent(handle, touchPointerEvent('pointermove', 210));
    expect(screen.getByRole('dialog', { name: 'Actions' })).toHaveAttribute(
      'data-bottom-sheet-dragging',
      'true',
    );
    fireEvent(handle, touchPointerEvent('pointerup', 210));

    expect(onRequestClose).toHaveBeenCalledTimes(3);
  });

  it('prevents dismiss gestures when persistent', () => {
    const onRequestClose = vi.fn();
    render(
      <BottomSheet
        open
        persistent
        aria-label="Required action"
        onRequestClose={onRequestClose}
      >
        Required action
      </BottomSheet>,
    );

    const overlay = document.querySelector('.lumen-bottom-sheet-overlay')!;
    fireEvent.pointerDown(overlay);
    fireEvent.click(overlay);
    fireEvent.keyDown(document, { key: 'Escape' });

    const handle = document.querySelector('[data-bottom-sheet-handle]')!;
    fireEvent(handle, touchPointerEvent('pointerdown', 100));
    fireEvent(handle, touchPointerEvent('pointermove', 240));
    fireEvent(handle, touchPointerEvent('pointerup', 240));

    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('keeps content mounted through its exit animation', () => {
    const onExited = vi.fn();
    const { rerender } = render(
      <BottomSheet open onRequestClose={() => undefined} onExited={onExited}>
        Cached content
      </BottomSheet>,
    );

    rerender(
      <BottomSheet open={false} onRequestClose={() => undefined} onExited={onExited}>
        {null}
      </BottomSheet>,
    );

    const sheet = screen.getByText('Cached content').closest('aside')!;
    expect(sheet).toHaveAttribute('data-bottom-sheet-state', 'closing');
    fireEvent.animationEnd(sheet);

    expect(screen.queryByText('Cached content')).not.toBeInTheDocument();
    expect(onExited).toHaveBeenCalledOnce();
  });

  it('uses a timeout fallback when animationend is unavailable', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <BottomSheet open onRequestClose={() => undefined}>
        Fallback content
      </BottomSheet>,
    );

    rerender(
      <BottomSheet open={false} onRequestClose={() => undefined}>
        {null}
      </BottomSheet>,
    );

    act(() => vi.advanceTimersByTime(259));
    expect(screen.getByText('Fallback content')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText('Fallback content')).not.toBeInTheDocument();
  });
});
