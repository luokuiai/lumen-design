import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from '../components/Tooltip';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Tooltip', () => {
  it('does not mount when the pointer leaves during the show delay', () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="Skipped details">
        <button type="button">Skipped trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Skipped trigger' });
    fireEvent.pointerEnter(trigger);
    act(() => vi.advanceTimersByTime(200));
    fireEvent.pointerLeave(trigger);
    act(() => vi.advanceTimersByTime(500));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('uses the default show and hide delays', () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="Delayed details">
        <button type="button">Delayed trigger</button>
      </Tooltip>,
    );

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Delayed trigger' }));
    act(() => vi.advanceTimersByTime(349));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('data-state', 'opening');

    fireEvent.animationEnd(tooltip);
    fireEvent.pointerLeave(screen.getByRole('button', { name: 'Delayed trigger' }));
    act(() => vi.advanceTimersByTime(149));
    expect(tooltip).toHaveAttribute('data-state', 'open');

    act(() => vi.advanceTimersByTime(1));
    expect(tooltip).toHaveAttribute('data-state', 'closing');
  });

  it('uses directional animations and unmounts after closing', () => {
    vi.useFakeTimers();
    render(
      <Tooltip content="Timing details" showDelay={0} hideDelay={0}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    fireEvent.pointerEnter(trigger);
    act(() => vi.advanceTimersByTime(0));

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveAttribute('data-state', 'opening');
    expect(tooltip).toHaveClass('lumen-tooltip');

    fireEvent.animationEnd(tooltip);
    expect(tooltip).toHaveAttribute('data-state', 'open');

    fireEvent.pointerLeave(trigger);
    act(() => vi.advanceTimersByTime(0));
    expect(tooltip).toHaveAttribute('data-state', 'closing');

    fireEvent.animationEnd(tooltip);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
