import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SwipeActions } from '../components/swipe-actions/SwipeActions';

const endAction = (onClick = vi.fn()) => ({
  key: 'delete',
  label: 'Delete',
  onClick,
  tone: 'danger' as const,
});

const pointer = (
  eventType: string,
  pointerType: 'touch' | 'mouse',
  x: number,
  y: number,
) => {
  const event = new Event(eventType, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerId: { value: 1 },
    pointerType: { value: pointerType },
  });
  return event;
};

const swipe = (element: HTMLElement, from: number, to: number) => {
  fireEvent(element, pointer('pointerdown', 'touch', from, 40));
  fireEvent(element, pointer('pointermove', 'touch', to, 42));
  fireEvent(element, pointer('pointerup', 'touch', to, 42));
};

describe('SwipeActions', () => {
  it('reveals end actions after a left swipe', () => {
    render(
      <SwipeActions endActions={[endAction()]}>
        <div>Message</div>
      </SwipeActions>,
    );
    const root = screen.getByText('Message').parentElement!.parentElement!;

    act(() => swipe(root, 180, 110));

    expect(root).toHaveAttribute('data-open-side', 'end');
    expect(screen.getByText('Message').parentElement).toHaveStyle({
      transform: 'translate3d(-72px, 0, 0)',
    });
  });

  it('keeps vertical gestures from opening actions', () => {
    render(
      <SwipeActions endActions={[endAction()]}>
        <div>Message</div>
      </SwipeActions>,
    );
    const root = screen.getByText('Message').parentElement!.parentElement!;

    fireEvent(root, pointer('pointerdown', 'touch', 180, 40));
    fireEvent(root, pointer('pointermove', 'touch', 170, 100));
    fireEvent(root, pointer('pointerup', 'touch', 170, 100));

    expect(root).not.toHaveAttribute('data-open-side');
  });

  it('runs an action and closes the row', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <SwipeActions endActions={[endAction(onClick)]}>
        <div>Message</div>
      </SwipeActions>,
    );
    const root = screen.getByText('Message').parentElement!.parentElement!;
    act(() => swipe(root, 180, 110));

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(root).not.toHaveAttribute('data-open-side');
  });

  it('supports a full swipe action', () => {
    const onClick = vi.fn();
    render(
      <SwipeActions fullSwipe endActions={[endAction(onClick)]}>
        <div>Message</div>
      </SwipeActions>,
    );
    const root = screen.getByText('Message').parentElement!.parentElement!;
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: 300 });

    act(() => swipe(root, 280, 40));

    expect(onClick).toHaveBeenCalledOnce();
    expect(root).not.toHaveAttribute('data-open-side');
  });

  it('ignores mouse drags and disabled rows', () => {
    const { rerender } = render(
      <SwipeActions endActions={[endAction()]}>
        <div>Message</div>
      </SwipeActions>,
    );
    const root = screen.getByText('Message').parentElement!.parentElement!;

    fireEvent(root, pointer('pointerdown', 'mouse', 180, 40));
    fireEvent(root, pointer('pointermove', 'mouse', 80, 40));
    fireEvent(root, pointer('pointerup', 'mouse', 80, 40));
    expect(root).not.toHaveAttribute('data-open-side');

    rerender(
      <SwipeActions disabled endActions={[endAction()]}>
        <div>Message</div>
      </SwipeActions>,
    );
    act(() => swipe(root, 180, 80));
    expect(root).not.toHaveAttribute('data-open-side');
  });
});
