import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Scrollbar } from '../components/Scrollbar';

describe('Scrollbar', () => {
  it('uses independent outer tracks and forwards scrolling through the viewport', () => {
    const ref = createRef<HTMLDivElement>();
    const onScroll = vi.fn();
    render(<Scrollbar ref={ref} placement="outer" orientation="both" autoHide onScroll={onScroll} aria-label="Outer scroll area"><div>Content</div></Scrollbar>);
    const viewport = screen.getByLabelText('Outer scroll area');
    const shell = viewport.parentElement!;
    expect(ref.current).toBe(viewport);
    expect(viewport).toHaveAttribute('data-placement', 'outer');
    expect(shell).toHaveAttribute('data-ui', 'scrollbar-shell');
    const vertical = shell.querySelector('[data-axis="y"]')!;
    const horizontal = shell.querySelector('[data-axis="x"]')!;
    expect(vertical.parentElement).toBe(shell);
    expect(viewport.contains(vertical)).toBe(false);
    expect(vertical).not.toHaveAttribute('data-overflow');
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 400 },
      clientWidth: { configurable: true, value: 200 },
      scrollWidth: { configurable: true, value: 400 },
    });
    fireEvent(window, new Event('resize'));
    expect(vertical).toHaveAttribute('data-overflow', 'true');
    expect(horizontal).toHaveAttribute('data-overflow', 'true');
    expect(vertical.firstElementChild).toHaveStyle({ height: '25px' });
    expect(horizontal.firstElementChild).toHaveStyle({ width: '100px' });
    viewport.scrollTop = 100;
    fireEvent.scroll(viewport);
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(vertical.firstElementChild).toHaveStyle({ transform: 'translateY(25px)' });
    fireEvent(vertical, Object.assign(new Event('pointerdown', { bubbles: true }), { button: 0, clientY: 75, pointerId: 1 }));
    expect(viewport.scrollTop).toBe(250);
    fireEvent(vertical, Object.assign(new Event('pointermove', { bubbles: true }), { clientY: 85, pointerId: 1 }));
    expect(viewport.scrollTop).toBe(290);
    fireEvent(vertical, Object.assign(new Event('pointerup', { bubbles: true }), { pointerId: 1 }));
    fireEvent(vertical, Object.assign(new Event('pointermove', { bubbles: true }), { clientY: 90, pointerId: 1 }));
    expect(viewport.scrollTop).toBe(290);
    Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 80 });
    fireEvent(window, new Event('resize'));
    expect(vertical).not.toHaveAttribute('data-overflow');
  });

  it('renders a keyboard-focusable vertical scroll region by default', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Scrollbar ref={ref} aria-label="事件记录">
        <div>事件内容</div>
      </Scrollbar>,
    );

    const scrollbar = screen.getByLabelText('事件记录');
    expect(scrollbar).toHaveAttribute('data-ui', 'scrollbar');
    expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
    expect(scrollbar).toHaveAttribute('data-size', 'md');
    expect(scrollbar).toHaveAttribute('tabindex', '0');
    expect(scrollbar).toHaveClass('overflow-x-hidden', 'overflow-y-auto');
    expect(ref.current).toBe(scrollbar);
  });

  it('supports horizontal scrolling, compact sizing, and auto-hide', () => {
    render(
      <Scrollbar
        aria-label="巡检看板"
        orientation="horizontal"
        size="sm"
        autoHide
      >
        <div>看板内容</div>
      </Scrollbar>,
    );

    const scrollbar = screen.getByLabelText('巡检看板');
    expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
    expect(scrollbar).toHaveAttribute('data-size', 'sm');
    expect(scrollbar).toHaveAttribute('data-auto-hide', 'true');
    expect(scrollbar).toHaveClass('overflow-x-auto', 'overflow-y-hidden');
  });
});
