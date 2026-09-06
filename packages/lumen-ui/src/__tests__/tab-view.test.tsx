import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabView } from '../components/TabView';

const items = [
  { value: 'overview', content: 'Overview panel' },
  { value: 'disabled', content: 'Disabled panel', disabled: true },
  { value: 'activity', content: <button type="button">Activity action</button> },
] as const;

const touchPointer = (type: string, x: number, y: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerId: { value: 1 },
    pointerType: { value: 'touch' },
  });
  return event;
};

describe('TabView', () => {
  it('renders controlled panels with inactive content removed from interaction', () => {
    const { container } = render(
      <TabView
        value="overview"
        items={items}
        idPrefix="account"
        onChange={() => undefined}
      />,
    );

    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    expect(panels[0]).toHaveAttribute('data-active', 'true');
    expect(panels[0]).toHaveAttribute('id', 'account-panel-overview');
    expect(panels[0]).toHaveAttribute('aria-labelledby', 'account-tab-overview');
    expect(panels[0]).not.toHaveAttribute('aria-hidden');
    expect(panels[1]).toHaveAttribute('aria-hidden', 'true');
    expect(panels[1]).toHaveAttribute('inert');
    expect(container.querySelector('[data-tab-view-track]')).toHaveStyle({
      transform: 'translate3d(calc(0% + 0px), 0, 0)',
    });
  });

  it('swipes to the next enabled panel and skips disabled items', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TabView value="overview" items={items} onChange={onChange} swipeable />,
    );
    const view = container.querySelector('[data-ui="tab-view"]')!;

    fireEvent(view, touchPointer('pointerdown', 260, 100));
    fireEvent(view, touchPointer('pointermove', 160, 104));
    expect(view).toHaveAttribute('data-dragging', 'true');
    fireEvent(view, touchPointer('pointerup', 160, 104));

    expect(onChange).toHaveBeenCalledWith('activity');
  });

  it('swipes right to the previous enabled panel', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TabView value="activity" items={items} onChange={onChange} swipeable />,
    );
    const view = container.querySelector('[data-ui="tab-view"]')!;

    fireEvent(view, touchPointer('pointerdown', 80, 100));
    fireEvent(view, touchPointer('pointermove', 160, 102));
    fireEvent(view, touchPointer('pointerup', 160, 102));

    expect(onChange).toHaveBeenCalledWith('overview');
  });

  it('does not switch for vertical gestures or gestures started on controls', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TabView value="activity" items={items} onChange={onChange} swipeable />,
    );
    const view = container.querySelector('[data-ui="tab-view"]')!;

    fireEvent(view, touchPointer('pointerdown', 100, 80));
    fireEvent(view, touchPointer('pointermove', 95, 160));
    fireEvent(view, touchPointer('pointerup', 95, 160));

    const button = screen.getByRole('button', { name: 'Activity action', hidden: true });
    fireEvent(button, touchPointer('pointerdown', 200, 100));
    fireEvent(button, touchPointer('pointermove', 100, 100));
    fireEvent(button, touchPointer('pointerup', 100, 100));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps edge gestures resisted without changing the value', () => {
    const onChange = vi.fn();
    const { container } = render(
      <TabView value="overview" items={items} onChange={onChange} swipeable />,
    );
    const view = container.querySelector('[data-ui="tab-view"]')!;

    fireEvent(view, touchPointer('pointerdown', 100, 100));
    fireEvent(view, touchPointer('pointermove', 200, 100));
    expect(container.querySelector('[data-tab-view-track]')).toHaveStyle({
      transform: 'translate3d(calc(0% + 24px), 0, 0)',
    });
    fireEvent(view, touchPointer('pointerup', 200, 100));

    expect(onChange).not.toHaveBeenCalled();
  });
});
