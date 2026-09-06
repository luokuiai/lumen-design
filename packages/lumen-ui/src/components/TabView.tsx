import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from './classNames';

export interface TabViewItem<T extends string> {
  value: T;
  content: React.ReactNode;
  disabled?: boolean;
  id?: string;
  ariaLabelledBy?: string;
  className?: string;
}

export interface TabViewProps<T extends string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  value: T;
  items: readonly TabViewItem<T>[];
  onChange: (value: T) => void;
  swipeable?: boolean;
  swipeThreshold?: number;
  velocityThreshold?: number;
  edgeSwipeWidth?: number;
  idPrefix?: string;
  trackClassName?: string;
  panelClassName?: string;
  swipeIgnoreSelector?: string;
}

type DragAxis = 'horizontal' | 'vertical';

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  offset: number;
  axis?: DragAxis;
};

const findAdjacentIndex = <T extends string>(
  items: readonly TabViewItem<T>[],
  activeIndex: number,
  step: -1 | 1,
) => {
  for (let index = activeIndex + step; index >= 0 && index < items.length; index += step) {
    if (!items[index]?.disabled) return index;
  }
  return -1;
};

const hasHorizontalScroll = (target: HTMLElement, root: HTMLElement) => {
  let current: HTMLElement | null = target;
  while (current && current !== root) {
    const overflowX = window.getComputedStyle(current).overflowX;
    if (
      current.scrollWidth > current.clientWidth
      && (overflowX === 'auto' || overflowX === 'scroll')
    ) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

export const TabView = <T extends string>({
  value,
  items,
  onChange,
  swipeable = false,
  swipeThreshold = 48,
  velocityThreshold = 0.45,
  edgeSwipeWidth = 20,
  idPrefix,
  trackClassName,
  panelClassName,
  swipeIgnoreSelector = 'a, button, input, select, textarea, [contenteditable="true"], [data-tab-view-swipe-ignore]',
  className,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: TabViewProps<T>) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const matchedIndex = items.findIndex((item) => item.value === value);
  const activeIndex = matchedIndex >= 0 ? matchedIndex : 0;

  const resetDrag = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    setDragOffset(0);
  }, []);

  useEffect(() => {
    resetDrag();
  }, [resetDrag, value]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    if (
      event.defaultPrevented
      || !swipeable
      || event.pointerType !== 'touch'
      || items.length < 2
      || event.clientX <= Math.max(0, edgeSwipeWidth)
      || event.clientX >= window.innerWidth - Math.max(0, edgeSwipeWidth)
    ) return;

    const target = event.target as HTMLElement;
    if (
      target.closest(swipeIgnoreSelector)
      || (rootRef.current && hasHorizontalScroll(target, rootRef.current))
    ) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      offset: 0,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    const drag = dragRef.current;
    if (event.defaultPrevented || !drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (!drag.axis) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;
      drag.axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
    }
    if (drag.axis === 'vertical') return;

    event.preventDefault();
    const step = deltaX < 0 ? 1 : -1;
    const hasDestination = findAdjacentIndex(items, activeIndex, step) >= 0;
    drag.offset = hasDestination ? deltaX : deltaX * 0.24;
    setDragging(true);
    setDragOffset(drag.offset);
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const width = rootRef.current?.clientWidth ?? 0;
    const distanceThreshold = width > 0
      ? Math.min(Math.max(0, swipeThreshold), width * 0.25)
      : Math.max(0, swipeThreshold);
    const shouldChange = drag.axis === 'horizontal'
      && (Math.abs(drag.offset) >= distanceThreshold
        || Math.abs(drag.offset) / elapsed >= Math.max(0, velocityThreshold));
    const step = drag.offset < 0 ? 1 : -1;
    const destination = findAdjacentIndex(items, activeIndex, step);
    resetDrag();
    if (shouldChange && destination >= 0) onChange(items[destination]!.value);
  };

  return (
    <div
      {...props}
      ref={rootRef}
      data-ui="tab-view"
      data-swipeable={swipeable || undefined}
      data-dragging={dragging || undefined}
      className={cn('min-w-0 overflow-hidden', className)}
      style={{ touchAction: swipeable ? 'pan-y' : undefined, ...style }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (!event.defaultPrevented) finishPointer(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        resetDrag();
      }}
    >
      <div
        data-tab-view-track
        data-lumen-motion
        className={cn(
          'flex w-full will-change-transform',
          dragging ? 'transition-none' : 'transition-transform duration-300 ease-out',
          trackClassName,
        )}
        style={{
          transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
        }}
      >
        {items.map((item, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={item.value}
              id={item.id ?? (idPrefix ? `${idPrefix}-panel-${item.value}` : undefined)}
              role="tabpanel"
              aria-hidden={!active || undefined}
              aria-labelledby={item.ariaLabelledBy ?? (idPrefix ? `${idPrefix}-tab-${item.value}` : undefined)}
              inert={!active}
              data-active={active || undefined}
              data-value={item.value}
              tabIndex={active ? 0 : -1}
              className={cn('w-full shrink-0', panelClassName, item.className)}
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};
