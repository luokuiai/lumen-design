import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Popover } from '../components/Popover';

describe('Popover', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens and positions content from its trigger', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(240);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(120);

    render(
      <Popover
        placement="bottom"
        align="start"
        ariaLabel="设备详情"
        trigger={({ toggle, open, popoverId }) => (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={popoverId}
            onClick={toggle}
          >
            打开详情
          </button>
        )}
      >
        设备在线
      </Popover>,
    );

    const trigger = screen.getByRole('button', { name: '打开详情' });
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      bottom: 70,
      height: 30,
      left: 100,
      right: 180,
      top: 40,
      width: 80,
      x: 100,
      y: 40,
      toJSON: () => ({}),
    });

    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: '设备详情' })).toHaveStyle({
      left: '100px',
      top: '78px',
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on outside click and Escape', () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        defaultOpen
        onOpenChange={onOpenChange}
        trigger={({ toggle }) => <button onClick={toggle}>触发器</button>}
      >
        浮层内容
      </Popover>,
    );

    fireEvent.mouseDown(document.body);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('button', { name: '触发器' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('button', { name: '触发器' })).toHaveFocus();
  });
});
