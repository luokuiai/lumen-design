import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLongPress, type LongPressPointerType } from '../hooks/useLongPress';

const LongPressButton = ({
  onLongPress,
  onClick,
  onCancel,
  disabled,
  pointerTypes,
}: {
  onLongPress: () => void;
  onClick?: () => void;
  onCancel?: (reason: string) => void;
  disabled?: boolean;
  pointerTypes?: readonly LongPressPointerType[];
}) => {
  const handlers = useLongPress<HTMLButtonElement>({
    onLongPress,
    onClick,
    onCancel,
    disabled,
    pointerTypes,
  });
  return <button type="button" {...handlers}>Hold</button>;
};

const pointerEvent = (type: string, x = 40, y = 40, pointerType = 'touch') => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: x },
    clientY: { value: y },
    isPrimary: { value: true },
    pointerId: { value: 1 },
    pointerType: { value: pointerType },
  });
  return event;
};

afterEach(() => {
  vi.useRealTimers();
});

describe('useLongPress', () => {
  it('fires after the delay and suppresses the following click', () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    render(<LongPressButton onLongPress={onLongPress} onClick={onClick} />);
    const button = screen.getByRole('button');

    fireEvent(button, pointerEvent('pointerdown'));
    act(() => vi.advanceTimersByTime(500));
    fireEvent(button, pointerEvent('pointerup'));
    fireEvent.click(button);

    expect(onLongPress).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps a short press as a normal click', () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    render(<LongPressButton onLongPress={onLongPress} onClick={onClick} />);
    const button = screen.getByRole('button');

    fireEvent(button, pointerEvent('pointerdown'));
    act(() => vi.advanceTimersByTime(200));
    fireEvent(button, pointerEvent('pointerup'));
    fireEvent.click(button);

    expect(onLongPress).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('cancels when the pointer moves beyond the threshold', () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const onCancel = vi.fn();
    render(<LongPressButton onLongPress={onLongPress} onCancel={onCancel} />);
    const button = screen.getByRole('button');

    fireEvent(button, pointerEvent('pointerdown'));
    fireEvent(button, pointerEvent('pointermove', 60));
    act(() => vi.advanceTimersByTime(500));

    expect(onLongPress).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledWith('move');
  });

  it('does not start while disabled', () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    render(<LongPressButton onLongPress={onLongPress} disabled />);

    fireEvent(screen.getByRole('button'), pointerEvent('pointerdown'));
    act(() => vi.advanceTimersByTime(500));

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('ignores mouse presses by default', () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    const onClick = vi.fn();
    render(<LongPressButton onLongPress={onLongPress} onClick={onClick} />);
    const button = screen.getByRole('button');

    fireEvent(button, pointerEvent('pointerdown', 40, 40, 'mouse'));
    act(() => vi.advanceTimersByTime(500));
    fireEvent.click(button);

    expect(onLongPress).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('supports opt-in mouse long presses', () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    render(<LongPressButton onLongPress={onLongPress} pointerTypes={['mouse']} />);
    const button = screen.getByRole('button');

    fireEvent(button, pointerEvent('pointerdown', 40, 40, 'mouse'));
    act(() => vi.advanceTimersByTime(500));

    expect(onLongPress).toHaveBeenCalledOnce();
  });
});
