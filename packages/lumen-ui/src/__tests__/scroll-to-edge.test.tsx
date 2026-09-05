import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScrollToEdge } from '../components/ScrollToEdge';

const setScrollMetrics = (
  element: HTMLElement,
  { top, height = 300, extent = 1200 }: { top: number; height?: number; extent?: number },
) => {
  Object.defineProperties(element, {
    scrollTop: { configurable: true, value: top, writable: true },
    clientHeight: { configurable: true, value: height },
    scrollHeight: { configurable: true, value: extent },
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ScrollToEdge', () => {
  it('shows after the container passes the top threshold and scrolls to the top', () => {
    const containerRef = createRef<HTMLDivElement>();
    const scrollTo = vi.fn();
    render(
      <div ref={containerRef}>
        <ScrollToEdge containerRef={containerRef} threshold={100} />
      </div>,
    );

    const container = containerRef.current!;
    container.scrollTo = scrollTo;
    setScrollMetrics(container, { top: 140 });
    fireEvent.scroll(container);

    const button = screen.getByRole('button', { name: '回到顶部' });
    expect(button).toHaveAttribute('data-visible', 'true');
    fireEvent.click(button);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('supports scrolling to the bottom and hides near that edge', () => {
    const containerRef = createRef<HTMLDivElement>();
    const scrollTo = vi.fn();
    render(
      <div ref={containerRef}>
        <ScrollToEdge direction="bottom" containerRef={containerRef} threshold={100} />
      </div>,
    );

    const container = containerRef.current!;
    container.scrollTo = scrollTo;
    setScrollMetrics(container, { top: 300 });
    fireEvent.scroll(container);

    const button = screen.getByRole('button', { name: '滚动到底部' });
    fireEvent.click(button);
    expect(scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: 'smooth' });

    container.scrollTop = 850;
    fireEvent.scroll(container);
    expect(button).not.toHaveAttribute('data-visible');
    expect(button).toHaveAttribute('tabindex', '-1');
  });

  it('supports forced visibility, custom positioning, and prevented scrolling', () => {
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    });
    render(
      <ScrollToEdge
        alwaysVisible
        direction="bottom"
        position="absolute"
        offset={12}
        safeArea={false}
        label="Jump down"
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button', { name: 'Jump down' });
    expect(button).toHaveClass('absolute', '!h-11', '!w-11');
    expect(button).toHaveStyle({ bottom: '12px', right: '12px' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
