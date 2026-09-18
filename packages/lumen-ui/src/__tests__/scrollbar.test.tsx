import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Scrollbar } from '../components/Scrollbar';

describe('Scrollbar', () => {
  it.each(['inner', 'outer'] as const)('tabs directly to controls in nested %s scroll regions', async (placement) => {
    const user = userEvent.setup();
    render(<>
      <button>Before</button>
      <Scrollbar placement={placement}>
        <Scrollbar placement={placement}>
          <button disabled>Disabled</button>
          <input aria-label="Name" />
          <button>Save</button>
        </Scrollbar>
      </Scrollbar>
      <button>After</button>
    </>);
    for (const control of [screen.getByText('Before'), screen.getByLabelText('Name'), screen.getByText('Save'), screen.getByText('After')]) {
      await user.tab();
      expect(control).toHaveFocus();
    }
    await user.tab({ shift: true });
    expect(screen.getByText('Save')).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByLabelText('Name')).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByText('Before')).toHaveFocus();
  });

  it.each(['inner', 'outer'] as const)('allows explicit keyboard access to a static %s scroll region', async (placement) => {
    const user = userEvent.setup();
    render(<>
      <Scrollbar placement={placement} tabIndex={0} aria-label="Records">Static records</Scrollbar>
      <button>Next</button>
    </>);
    await user.tab();
    expect(screen.getByLabelText('Records')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('Next')).toHaveFocus();
  });

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

  it('keeps the default scroll region out of the tab order', () => {
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
    expect(scrollbar).toHaveAttribute('tabindex', '-1');
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
