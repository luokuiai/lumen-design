import React, { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PullToRefresh } from '../components/pull-to-refresh/PullToRefresh';
import { LumenProvider } from '../components/LumenProvider';
import { enUS } from '../i18n';

const touch = (clientX: number, clientY: number) => ({
  touches: [{ clientX, clientY }],
});

describe('PullToRefresh', () => {
  it('renders an accessible scroll container with localized status text', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <LumenProvider locale={enUS}>
        <PullToRefresh ref={ref} onRefresh={() => undefined}>
          Content
        </PullToRefresh>
      </LumenProvider>,
    );

    const container = screen.getByText('Content').closest('[data-ui="pull-to-refresh"]');
    expect(container).toHaveAttribute('data-state', 'idle');
    expect(container).toHaveClass('overflow-y-auto', 'overscroll-y-contain');
    expect(container).toHaveStyle({ scrollbarGutter: 'stable' });
    expect(screen.getByRole('status')).toHaveTextContent('Pull to refresh');
    expect(screen.getByRole('status')).toHaveClass('h-10', 'w-10', 'rounded-full');
    expect(screen.getByText('Pull to refresh')).toHaveClass('sr-only');
    expect(ref.current).toBe(container);
  });

  it('moves through pulling and ready states, then resets after refresh', async () => {
    let resolveRefresh!: () => void;
    const refresh = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });
    const onRefresh = vi.fn(() => refresh);

    render(
      <PullToRefresh onRefresh={onRefresh}>
        <div>Latest events</div>
      </PullToRefresh>,
    );

    const container = screen.getByText('Latest events').closest('[data-ui="pull-to-refresh"]')!;
    const content = container.querySelector('[data-pull-to-refresh-content]');

    fireEvent.touchStart(container, touch(20, 20));
    fireEvent.touchMove(container, touch(22, 100));
    expect(container).toHaveAttribute('data-state', 'pulling');
    expect(content).not.toHaveAttribute('style');

    fireEvent.touchMove(container, touch(22, 180));
    expect(container).toHaveAttribute('data-state', 'ready');
    expect(screen.getByRole('status')).toHaveTextContent('释放刷新');

    fireEvent.touchEnd(container);
    expect(onRefresh).toHaveBeenCalledOnce();
    expect(container).toHaveAttribute('data-state', 'refreshing');
    expect(container).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveRefresh();
      await refresh;
    });

    expect(container).toHaveAttribute('data-state', 'idle');
    expect(container).not.toHaveAttribute('aria-busy');
    expect(content).not.toHaveAttribute('style');
  });

  it('ignores gestures away from the scroll top, horizontal drags, and disabled state', () => {
    const onRefresh = vi.fn();
    const { rerender } = render(
      <PullToRefresh onRefresh={onRefresh}>Events</PullToRefresh>,
    );
    const container = screen.getByText('Events').closest('[data-ui="pull-to-refresh"]') as HTMLDivElement;

    container.scrollTop = 12;
    fireEvent.touchStart(container, touch(10, 10));
    fireEvent.touchMove(container, touch(10, 180));
    fireEvent.touchEnd(container);
    expect(container).toHaveAttribute('data-state', 'idle');

    container.scrollTop = 0;
    fireEvent.touchStart(container, touch(10, 10));
    fireEvent.touchMove(container, touch(100, 20));
    fireEvent.touchEnd(container);
    expect(container).toHaveAttribute('data-state', 'idle');

    rerender(
      <PullToRefresh disabled onRefresh={onRefresh}>Events</PullToRefresh>,
    );
    fireEvent.touchStart(container, touch(10, 10));
    fireEvent.touchMove(container, touch(10, 180));
    fireEvent.touchEnd(container);

    expect(onRefresh).not.toHaveBeenCalled();
    expect(container).toHaveAttribute('data-state', 'idle');
  });
});
