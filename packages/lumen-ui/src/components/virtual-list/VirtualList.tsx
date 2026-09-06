import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn } from '../classNames';

export type VirtualListItemSize<T> = number | ((item: T, index: number) => number);
export type VirtualListScrollAlign = 'auto' | 'start' | 'center' | 'end';

export interface VirtualListRange {
  /** 第一个可见项索引。 */
  startIndex: number;
  /** 最后一个可见项索引。 */
  endIndex: number;
  /** 包含预渲染区域的起始索引。 */
  overscanStartIndex: number;
  /** 包含预渲染区域的结束索引。 */
  overscanEndIndex: number;
}

export interface VirtualListScrollOptions {
  align?: VirtualListScrollAlign;
  behavior?: ScrollBehavior;
}

export interface VirtualListHandle {
  scrollToIndex: (index: number, options?: VirtualListScrollOptions) => void;
  scrollToOffset: (offset: number, behavior?: ScrollBehavior) => void;
  getScrollElement: () => HTMLDivElement | null;
}

export interface VirtualListProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 列表数据。 */
  items: readonly T[];
  /** 固定项高度，或根据数据返回每项高度的函数。 */
  itemSize: VirtualListItemSize<T>;
  /** 渲染列表项。 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 返回稳定的列表项 key，默认使用索引。 */
  getItemKey?: (item: T, index: number) => React.Key;
  /** 可滚动视口高度。 */
  height?: number | string;
  /** 可见区域上下额外渲染的项目数。 */
  overscan?: number;
  /** 首次渲染时滚动到的项目索引。 */
  initialScrollIndex?: number;
  /** 可见及预渲染范围变化时调用。 */
  onRangeChange?: (range: VirtualListRange) => void;
  /** 数据为空时显示的内容。 */
  emptyContent?: React.ReactNode;
  /** 内容容器类名。 */
  contentClassName?: string;
  /** 列表项类名或类名生成函数。 */
  itemClassName?: string | ((item: T, index: number) => string | undefined);
}

type Measurements = {
  offsets: number[];
  sizes: number[];
  totalSize: number;
};

const normalizeSize = (size: number) =>
  Number.isFinite(size) ? Math.max(1, size) : 1;

const createMeasurements = <T,>(
  items: readonly T[],
  itemSize: VirtualListItemSize<T>,
): Measurements => {
  const offsets = new Array<number>(items.length + 1);
  const sizes = new Array<number>(items.length);
  offsets[0] = 0;
  items.forEach((item, index) => {
    const size = normalizeSize(
      typeof itemSize === 'function' ? itemSize(item, index) : itemSize,
    );
    sizes[index] = size;
    offsets[index + 1] = (offsets[index] ?? 0) + size;
  });
  return { offsets, sizes, totalSize: offsets[items.length] ?? 0 };
};

const findItemAtOffset = (offsets: number[], offset: number) => {
  const itemCount = Math.max(0, offsets.length - 1);
  let low = 0;
  let high = itemCount;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if ((offsets[middle + 1] ?? 0) <= offset) low = middle + 1;
    else high = middle;
  }
  return Math.min(low, Math.max(0, itemCount - 1));
};

const findFirstOffsetAtOrAfter = (offsets: number[], offset: number) => {
  let low = 0;
  let high = offsets.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if ((offsets[middle] ?? 0) < offset) low = middle + 1;
    else high = middle;
  }
  return low;
};

export const VirtualList = React.forwardRef(function VirtualListInner<T>(
  {
    items,
    itemSize,
    renderItem,
    getItemKey,
    height = 320,
    overscan = 3,
    initialScrollIndex = 0,
    onRangeChange,
    emptyContent = null,
    contentClassName,
    itemClassName,
    className,
    style,
    onScroll,
    ...props
  }: VirtualListProps<T>,
  forwardedRef: React.ForwardedRef<VirtualListHandle>,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialScrollAppliedRef = useRef(false);
  const lastReportedRangeRef = useRef('');
  const onRangeChangeRef = useRef(onRangeChange);
  const measurements = useMemo(
    () => createMeasurements(items, itemSize),
    [itemSize, items],
  );
  const fallbackViewportHeight = typeof height === 'number' ? height : 0;
  const [viewportHeight, setViewportHeight] = useState(fallbackViewportHeight);
  const [scrollOffset, setScrollOffset] = useState(0);
  onRangeChangeRef.current = onRangeChange;

  const scrollToOffset = useCallback((offset: number, behavior: ScrollBehavior = 'auto') => {
    const element = scrollRef.current;
    if (!element) return;
    const nextOffset = Math.min(
      Math.max(0, offset),
      Math.max(0, measurements.totalSize - element.clientHeight),
    );
    if (typeof element.scrollTo === 'function') {
      element.scrollTo({ top: nextOffset, behavior });
    } else {
      element.scrollTop = nextOffset;
    }
    if (behavior === 'auto') setScrollOffset(nextOffset);
  }, [measurements.totalSize]);

  const scrollToIndex = useCallback((index: number, options: VirtualListScrollOptions = {}) => {
    if (items.length === 0) return;
    const resolvedIndex = Math.min(Math.max(0, index), items.length - 1);
    const start = measurements.offsets[resolvedIndex] ?? 0;
    const end = measurements.offsets[resolvedIndex + 1] ?? start;
    const currentOffset = scrollRef.current?.scrollTop ?? scrollOffset;
    const currentViewportHeight = scrollRef.current?.clientHeight || viewportHeight;
    const align = options.align ?? 'auto';
    let nextOffset = currentOffset;

    if (align === 'start') nextOffset = start;
    if (align === 'center') nextOffset = start - (currentViewportHeight - (end - start)) / 2;
    if (align === 'end') nextOffset = end - currentViewportHeight;
    if (align === 'auto') {
      if (start < currentOffset) nextOffset = start;
      else if (end > currentOffset + currentViewportHeight) {
        nextOffset = end - currentViewportHeight;
      }
    }
    scrollToOffset(nextOffset, options.behavior);
  }, [items.length, measurements.offsets, scrollOffset, scrollToOffset, viewportHeight]);

  useImperativeHandle(forwardedRef, () => ({
    scrollToIndex,
    scrollToOffset,
    getScrollElement: () => scrollRef.current,
  }), [scrollToIndex, scrollToOffset]);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const updateViewportHeight = () => {
      setViewportHeight(element.clientHeight || fallbackViewportHeight);
    };
    updateViewportHeight();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateViewportHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fallbackViewportHeight, height]);

  useLayoutEffect(() => {
    if (initialScrollAppliedRef.current || items.length === 0) return;
    initialScrollAppliedRef.current = true;
    const index = Math.min(Math.max(0, initialScrollIndex), items.length - 1);
    const offset = measurements.offsets[index] ?? 0;
    if (scrollRef.current) scrollRef.current.scrollTop = offset;
    setScrollOffset(offset);
  }, [initialScrollIndex, items.length, measurements.offsets]);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const maxOffset = Math.max(0, measurements.totalSize - viewportHeight);
    if (element.scrollTop <= maxOffset) return;
    element.scrollTop = maxOffset;
    setScrollOffset(maxOffset);
  }, [measurements.totalSize, viewportHeight]);

  const range = useMemo<VirtualListRange>(() => {
    if (items.length === 0) {
      return {
        startIndex: -1,
        endIndex: -1,
        overscanStartIndex: -1,
        overscanEndIndex: -1,
      };
    }
    const startIndex = findItemAtOffset(measurements.offsets, scrollOffset);
    const visibleEndOffset = Math.min(
      measurements.totalSize,
      scrollOffset + viewportHeight,
    );
    const endIndex = Math.max(
      startIndex,
      Math.min(
        items.length - 1,
        findFirstOffsetAtOrAfter(measurements.offsets, visibleEndOffset) - 1,
      ),
    );
    const overscanCount = Math.max(0, Math.floor(overscan));
    return {
      startIndex,
      endIndex,
      overscanStartIndex: Math.max(0, startIndex - overscanCount),
      overscanEndIndex: Math.min(items.length - 1, endIndex + overscanCount),
    };
  }, [items.length, measurements.offsets, measurements.totalSize, overscan, scrollOffset, viewportHeight]);

  useEffect(() => {
    const rangeKey = `${range.startIndex}:${range.endIndex}:${range.overscanStartIndex}:${range.overscanEndIndex}`;
    if (lastReportedRangeRef.current === rangeKey) return;
    lastReportedRangeRef.current = rangeKey;
    onRangeChangeRef.current?.(range);
  }, [range]);

  const renderedItems: React.ReactNode[] = [];
  if (range.overscanStartIndex >= 0) {
    for (let index = range.overscanStartIndex; index <= range.overscanEndIndex; index += 1) {
      const item = items[index] as T;
      const resolvedItemClassName = typeof itemClassName === 'function'
        ? itemClassName(item, index)
        : itemClassName;
      renderedItems.push(
        <div
          key={getItemKey?.(item, index) ?? index}
          role="listitem"
          aria-posinset={index + 1}
          aria-setsize={items.length}
          data-index={index}
          className={cn('absolute left-0 top-0 w-full', resolvedItemClassName)}
          style={{
            height: measurements.sizes[index],
            transform: `translateY(${measurements.offsets[index]}px)`,
          }}
        >
          {renderItem(item, index)}
        </div>,
      );
    }
  }

  return (
    <div
      {...props}
      ref={scrollRef}
      role={props.role ?? 'list'}
      data-ui="virtual-list"
      data-size="sm"
      className={cn(
        'lumen-scrollbar relative overflow-x-hidden overflow-y-auto overscroll-contain',
        className,
      )}
      style={{ ...style, height }}
      onScroll={(event) => {
        setScrollOffset(event.currentTarget.scrollTop);
        onScroll?.(event);
      }}
    >
      {items.length === 0 ? (
        <div className="flex h-full items-center justify-center text-[14px] text-[var(--lumen-color-text-muted)]">
          {emptyContent}
        </div>
      ) : (
        <div
          className={cn('relative w-full', contentClassName)}
          style={{ height: measurements.totalSize }}
        >
          {renderedItems}
        </div>
      )}
    </div>
  );
}) as <T>(
  props: VirtualListProps<T> & React.RefAttributes<VirtualListHandle>,
) => React.ReactElement;
