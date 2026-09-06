import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from '../components/carousel/Carousel';

const items = [
  { id: 'overview', content: <div>Overview</div>, ariaLabel: 'Overview slide' },
  { id: 'events', content: <div>Events</div>, ariaLabel: 'Events slide' },
  { id: 'reports', content: <div>Reports</div>, ariaLabel: 'Reports slide' },
];

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

afterEach(() => {
  vi.useRealTimers();
});

describe('Carousel', () => {
  it('renders an accessible active slide and indicators', () => {
    const { container } = render(<Carousel items={items} ariaLabel="Highlights" />);
    const carousel = screen.getByRole('region', { name: 'Highlights' });

    expect(carousel).toHaveAttribute('data-value', 'overview');
    expect(container.querySelector('[data-carousel-viewport]')).toHaveClass('inset-0');
    expect(container.querySelector('[data-carousel-item][data-active="true"]')).toHaveTextContent('Overview');
    expect(screen.getByRole('tab', { name: 'Overview slide' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: '下一张' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '下一张' })).toHaveClass('mobile:hidden');
  });

  it('navigates with arrows and respects non-looping edges', async () => {
    const user = userEvent.setup();
    render(<Carousel items={items} loop={false} />);

    expect(screen.getByRole('button', { name: '上一张' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '下一张' }));
    expect(screen.getByRole('region')).toHaveAttribute('data-value', 'events');
  });

  it('supports controlled values without mutating them internally', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Carousel items={items} value="overview" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '下一张' }));

    expect(onChange).toHaveBeenCalledWith('events', 1);
    expect(screen.getByRole('region')).toHaveAttribute('data-value', 'overview');
  });

  it('supports keyboard navigation and loops across the first edge', () => {
    render(<Carousel items={items} />);
    const carousel = screen.getByRole('region');

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });

    expect(carousel).toHaveAttribute('data-value', 'reports');
  });

  it('uses cloned edge slides for a continuous last-to-first transition', async () => {
    const user = userEvent.setup();
    const { container } = render(<Carousel items={items} defaultValue="reports" />);
    const track = container.querySelector('[data-carousel-track]')!;

    await user.click(screen.getByRole('button', { name: '下一张' }));
    expect(screen.getByRole('region')).toHaveAttribute('data-value', 'overview');
    expect(track).toHaveStyle({ transform: 'translate3d(calc(-400% + 0px), 0, 0)' });

    fireEvent.transitionEnd(track, { propertyName: 'transform' });
    expect(track).toHaveStyle({ transform: 'translate3d(calc(-100% + 0px), 0, 0)' });
  });

  it('follows a horizontal touch gesture and changes slides', () => {
    const { container } = render(<Carousel items={items} edgeSwipeWidth={0} />);
    const carousel = container.querySelector('[data-ui="carousel"]')!;
    Object.defineProperty(carousel, 'clientWidth', { configurable: true, value: 320 });

    fireEvent(carousel, touchPointer('pointerdown', 240, 100));
    fireEvent(carousel, touchPointer('pointermove', 150, 104));
    expect(carousel).toHaveAttribute('data-dragging', 'true');
    fireEvent(carousel, touchPointer('pointerup', 150, 104));

    expect(carousel).toHaveAttribute('data-value', 'events');
  });

  it('ignores vertical gestures and gestures starting on controls', () => {
    const onChange = vi.fn();
    const interactiveItems = [
      { id: 'first', content: <button type="button">Open</button> },
      { id: 'second', content: <div>Second</div> },
    ];
    const { container } = render(
      <Carousel items={interactiveItems} onChange={onChange} edgeSwipeWidth={0} />,
    );
    const carousel = container.querySelector('[data-ui="carousel"]')!;

    fireEvent(carousel, touchPointer('pointerdown', 200, 80));
    fireEvent(carousel, touchPointer('pointermove', 190, 160));
    fireEvent(carousel, touchPointer('pointerup', 190, 160));
    const button = screen.getByRole('button', { name: 'Open' });
    fireEvent(button, touchPointer('pointerdown', 200, 100));
    fireEvent(button, touchPointer('pointermove', 100, 100));
    fireEvent(button, touchPointer('pointerup', 100, 100));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('autoplays by default at the configured interval', () => {
    vi.useFakeTimers();
    render(<Carousel items={items} interval={1200} />);

    act(() => vi.advanceTimersByTime(1200));

    expect(screen.getByRole('region')).toHaveAttribute('data-value', 'events');
  });
});
