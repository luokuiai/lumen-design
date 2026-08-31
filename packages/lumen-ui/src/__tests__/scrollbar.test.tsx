import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Scrollbar } from '../components/Scrollbar';

describe('Scrollbar', () => {
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
