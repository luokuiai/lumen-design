import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLumenLocale } from '../../i18n';
import { cn } from '../classNames';

export interface CarouselItem {
  /** 轮播项的唯一标识。 */
  id: string;
  /** 轮播项内容。 */
  content: React.ReactNode;
  /** 轮播项的无障碍名称。 */
  ariaLabel?: string;
  /** 轮播项附加类名。 */
  className?: string;
}

export interface CarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue' | 'onChange'> {
  /** 轮播项数据。 */
  items: readonly CarouselItem[];
  /** 受控模式下当前轮播项标识。 */
  value?: string;
  /** 非受控模式下的默认轮播项标识。 */
  defaultValue?: string;
  /** 当前轮播项变化时触发。 */
  onChange?: (value: string, index: number) => void;
  /** 是否循环轮播。 */
  loop?: boolean;
  /** 是否显示前后导航按钮。 */
  showArrows?: boolean;
  /** 是否显示底部指示点。 */
  showIndicators?: boolean;
  /** 是否自动轮播。 */
  autoplay?: boolean;
  /** 自动轮播间隔，单位毫秒。 */
  interval?: number;
  /** 鼠标悬停时是否暂停自动轮播。 */
  pauseOnHover?: boolean;
  /** 是否允许触摸手势切换。 */
  swipeable?: boolean;
  /** 触发切换所需的最小滑动距离。 */
  swipeThreshold?: number;
  /** 触发切换的最小滑动速度。 */
  velocityThreshold?: number;
  /** 忽略屏幕边缘手势的宽度。 */
  edgeSwipeWidth?: number;
  /** 轮播可视区域高度。 */
  height?: number | string;
  /** 自定义上一项图标。 */
  previousIcon?: React.ReactNode;
  /** 自定义下一项图标。 */
  nextIcon?: React.ReactNode;
  /** 自定义无障碍名称。 */
  ariaLabel?: string;
  /** 轮播项附加类名。 */
  itemClassName?: string;
  /** 指示点容器附加类名。 */
  indicatorsClassName?: string;
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

const interactiveSelector = 'a, button, input, select, textarea, [contenteditable="true"], [data-carousel-swipe-ignore]';

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(({
  items,
  value,
  defaultValue,
  onChange,
  loop = true,
  showArrows = true,
  showIndicators = true,
  autoplay = true,
  interval = 5000,
  pauseOnHover = true,
  swipeable = true,
  swipeThreshold = 48,
  velocityThreshold = 0.45,
  edgeSwipeWidth = 20,
  height = 280,
  previousIcon,
  nextIcon,
  ariaLabel,
  itemClassName,
  indicatorsClassName,
  className,
  style,
  tabIndex = 0,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}, forwardedRef) => {
  const locale = useLumenLocale();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items[0]?.id ?? '',
  );
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const resolvedValue = value ?? internalValue;
  const matchedIndex = items.findIndex((item) => item.id === resolvedValue);
  const activeIndex = matchedIndex >= 0 ? matchedIndex : 0;
  const itemCount = items.length;
  const looping = loop && itemCount > 1;
  const [trackIndex, setTrackIndex] = useState(() => (looping ? activeIndex + 1 : activeIndex));
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const pendingValueRef = useRef<string | null>(null);
  const wrapSnapIndexRef = useRef<number | null>(null);
  const transitionFrameRef = useRef<number | null>(null);

  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  const resetDrag = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    setDragOffset(0);
  }, []);

  const enableTransitionNextFrame = useCallback(() => {
    if (transitionFrameRef.current !== null) cancelAnimationFrame(transitionFrameRef.current);
    transitionFrameRef.current = requestAnimationFrame(() => {
      transitionFrameRef.current = requestAnimationFrame(() => {
        setTransitionEnabled(true);
        transitionFrameRef.current = null;
      });
    });
  }, []);

  const selectIndex = useCallback((nextIndex: number, requestedTrackIndex?: number) => {
    if (!itemCount) return;
    const normalizedIndex = loop
      ? (nextIndex + itemCount) % itemCount
      : Math.min(Math.max(nextIndex, 0), itemCount - 1);
    const nextItem = items[normalizedIndex];
    if (!nextItem || normalizedIndex === activeIndex) return;
    let nextTrackIndex = requestedTrackIndex ?? (looping ? normalizedIndex + 1 : normalizedIndex);
    if (looping && requestedTrackIndex === undefined) {
      const delta = normalizedIndex - activeIndex;
      if (delta > itemCount / 2) nextTrackIndex = 0;
      if (delta < -itemCount / 2) nextTrackIndex = itemCount + 1;
    }
    wrapSnapIndexRef.current = nextTrackIndex === 0
      ? itemCount
      : nextTrackIndex === itemCount + 1
        ? 1
        : null;
    pendingValueRef.current = nextItem.id;
    setTransitionEnabled(true);
    setTrackIndex(nextTrackIndex);
    if (value === undefined) setInternalValue(nextItem.id);
    onChange?.(nextItem.id, normalizedIndex);
  }, [activeIndex, itemCount, items, loop, looping, onChange, value]);

  const canMove = useCallback((step: -1 | 1) => (
    itemCount > 1 && (loop || (activeIndex + step >= 0 && activeIndex + step < itemCount))
  ), [activeIndex, itemCount, loop]);

  const selectStep = useCallback((step: -1 | 1) => {
    const currentTrackIndex = looping ? activeIndex + 1 : activeIndex;
    selectIndex(activeIndex + step, currentTrackIndex + step);
  }, [activeIndex, looping, selectIndex]);

  useEffect(() => {
    resetDrag();
    if (pendingValueRef.current === resolvedValue) {
      pendingValueRef.current = null;
      return;
    }
    wrapSnapIndexRef.current = null;
    setTransitionEnabled(false);
    setTrackIndex(looping ? activeIndex + 1 : activeIndex);
    enableTransitionNextFrame();
  }, [activeIndex, enableTransitionNextFrame, looping, resetDrag, resolvedValue]);

  useEffect(() => () => {
    if (transitionFrameRef.current !== null) cancelAnimationFrame(transitionFrameRef.current);
  }, []);

  useEffect(() => {
    if (
      !autoplay
      || itemCount < 2
      || dragging
      || focusWithin
      || (pauseOnHover && hovered)
    ) return undefined;
    const timer = window.setInterval(() => selectStep(1), Math.max(1000, interval));
    return () => window.clearInterval(timer);
  }, [autoplay, dragging, focusWithin, hovered, interval, itemCount, pauseOnHover, selectStep]);

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const width = rootRef.current?.clientWidth ?? 0;
    const distanceThreshold = width
      ? Math.min(Math.max(0, swipeThreshold), width * 0.25)
      : Math.max(0, swipeThreshold);
    const shouldChange = drag.axis === 'horizontal'
      && (Math.abs(drag.offset) >= distanceThreshold
        || Math.abs(drag.offset) / elapsed >= Math.max(0, velocityThreshold));
    const step = drag.offset < 0 ? 1 : -1;
    resetDrag();
    if (shouldChange && canMove(step)) selectStep(step);
  };

  const previousLabel = locale.accessibility.carouselPrevious ?? 'Previous slide';
  const nextLabel = locale.accessibility.carouselNext ?? 'Next slide';
  const slideLabel = (index: number) => locale.accessibility.carouselSlide?.(index + 1, itemCount)
    ?? `${index + 1} / ${itemCount}`;
  const renderedItems = looping
    ? [
        { item: items[itemCount - 1]!, itemIndex: itemCount - 1, clone: 'before' },
        ...items.map((item, itemIndex) => ({ item, itemIndex, clone: null })),
        { item: items[0]!, itemIndex: 0, clone: 'after' },
      ]
    : items.map((item, itemIndex) => ({ item, itemIndex, clone: null }));

  return (
    <div
      {...props}
      ref={setRootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel ?? locale.accessibility.carousel ?? 'Carousel'}
      data-ui="carousel"
      data-dragging={dragging || undefined}
      data-value={items[activeIndex]?.id}
      tabIndex={tabIndex}
      className={cn(
        'group relative min-w-0 overflow-hidden rounded-[var(--lumen-radius-card)] bg-[var(--lumen-color-surface-muted)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/30',
        className,
      )}
      style={{ height, touchAction: swipeable ? 'pan-y' : undefined, ...style }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || itemCount < 2) return;
        const target = event.target as HTMLElement;
        if (target !== event.currentTarget && target.closest(interactiveSelector)) return;
        if (event.key === 'ArrowLeft' && canMove(-1)) {
          event.preventDefault();
          selectStep(-1);
        } else if (event.key === 'ArrowRight' && canMove(1)) {
          event.preventDefault();
          selectStep(1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          selectIndex(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          selectIndex(itemCount - 1);
        }
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (
          event.defaultPrevented
          || !swipeable
          || (event.pointerType !== 'touch' && event.pointerType !== 'pen')
          || itemCount < 2
          || event.clientX <= Math.max(0, edgeSwipeWidth)
          || event.clientX >= window.innerWidth - Math.max(0, edgeSwipeWidth)
          || (event.target as HTMLElement).closest(interactiveSelector)
        ) return;
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startTime: performance.now(),
          offset: 0,
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerMove={(event) => {
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
        drag.offset = canMove(step) ? deltaX : deltaX * 0.24;
        setDragging(true);
        setDragOffset(drag.offset);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (!event.defaultPrevented) finishPointer(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        resetDrag();
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        setHovered(true);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        setHovered(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        setFocusWithin(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
      }}
    >
      <div
        data-carousel-viewport
        className="absolute inset-0 overflow-hidden"
        aria-live={autoplay ? 'off' : 'polite'}
      >
        <div
          data-carousel-track
          className={cn(
            'flex h-full w-full will-change-transform',
            dragging || !transitionEnabled ? 'transition-none' : 'transition-transform duration-300 ease-out',
          )}
          style={{
            transform: `translate3d(calc(${-trackIndex * 100}% + ${dragOffset}px), 0, 0)`,
          }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget || wrapSnapIndexRef.current === null) return;
            const snapIndex = wrapSnapIndexRef.current;
            wrapSnapIndexRef.current = null;
            setTransitionEnabled(false);
            setTrackIndex(snapIndex);
            enableTransitionNextFrame();
          }}
        >
          {renderedItems.map(({ item, itemIndex, clone }) => {
            const active = !clone && itemIndex === activeIndex;
          return (
            <div
              key={clone ? `${item.id}-${clone}` : item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={item.ariaLabel ?? slideLabel(itemIndex)}
              aria-hidden={Boolean(clone) || !active ? true : undefined}
              inert={Boolean(clone) || !active}
              data-carousel-item
              data-active={active || undefined}
              data-clone={clone ?? undefined}
              className={cn(
                'relative h-full w-full shrink-0',
                itemClassName,
                item.className,
              )}
            >
              {item.content}
            </div>
          );
          })}
        </div>
      </div>

      {showArrows && itemCount > 1 ? (
        <>
          <button
            type="button"
            aria-label={previousLabel}
            disabled={!canMove(-1)}
            onClick={() => selectStep(-1)}
            className="mobile:hidden absolute left-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--lumen-color-surface)]/80 text-[var(--lumen-color-text)] shadow-[var(--lumen-shadow-control)] transition-[background-color,opacity,transform] hover:bg-[var(--lumen-color-surface)]/95 active:scale-95 disabled:opacity-35"
          >
            {previousIcon ?? <ChevronLeft aria-hidden="true" size={18} />}
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            disabled={!canMove(1)}
            onClick={() => selectStep(1)}
            className="mobile:hidden absolute right-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--lumen-color-surface)]/80 text-[var(--lumen-color-text)] shadow-[var(--lumen-shadow-control)] transition-[background-color,opacity,transform] hover:bg-[var(--lumen-color-surface)]/95 active:scale-95 disabled:opacity-35"
          >
            {nextIcon ?? <ChevronRight aria-hidden="true" size={18} />}
          </button>
        </>
      ) : null}

      {showIndicators && itemCount > 1 ? (
        <div
          role="tablist"
          aria-label={locale.accessibility.carouselPagination ?? 'Choose slide'}
          className={cn(
            'absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/20 px-2 py-1 mobile:gap-1 mobile:px-1.5 mobile:py-[3px]',
            indicatorsClassName,
          )}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={item.ariaLabel ?? slideLabel(index)}
              onClick={() => selectIndex(index)}
              className={cn(
                'h-1.5 rounded-full bg-white shadow-sm transition-[width,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white mobile:h-[5px]',
                index === activeIndex
                  ? 'w-4 opacity-100 mobile:w-[14px]'
                  : 'w-1.5 opacity-60 hover:opacity-90 mobile:w-[5px]',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
});

Carousel.displayName = 'Carousel';
