import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../classNames';

export type SwipeActionsSide = 'start' | 'end';
export type SwipeActionTone = 'primary' | 'success' | 'danger' | 'neutral';

export interface SwipeAction {
  key: React.Key;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  tone?: SwipeActionTone;
  disabled?: boolean;
  className?: string;
}

export interface SwipeActionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 可滑动的前景内容。 */
  children: React.ReactNode;
  /** 向右滑动时展示的起始侧动作。 */
  startActions?: readonly SwipeAction[];
  /** 向左滑动时展示的结束侧动作。 */
  endActions?: readonly SwipeAction[];
  /** 受控模式下当前展开的一侧。 */
  openSide?: SwipeActionsSide | null;
  /** 非受控模式下默认展开的一侧。 */
  defaultOpenSide?: SwipeActionsSide | null;
  /** 展开侧变化时触发。 */
  onOpenChange?: (side: SwipeActionsSide | null) => void;
  /** 每个动作按钮的宽度。 */
  actionWidth?: number;
  /** 展开动作所需的滑动比例或像素距离。 */
  threshold?: number;
  /** 是否允许长距离滑动直接触发首个动作。 */
  fullSwipe?: boolean;
  /** 全滑触发距离占容器宽度的比例。 */
  fullSwipeThreshold?: number;
  /** 是否禁用滑动交互。 */
  disabled?: boolean;
  /** 触发动作后是否自动收起。 */
  closeOnAction?: boolean;
  /** 不响应滑动手势的后代元素选择器。 */
  swipeIgnoreSelector?: string;
  /** 前景内容的附加类名。 */
  contentClassName?: string;
}

type DragAxis = 'horizontal' | 'vertical';

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  startOffset: number;
  offset: number;
  axis?: DragAxis;
};

const toneClassNames: Record<SwipeActionTone, string> = {
  primary: 'bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)]',
  success: 'bg-[var(--lumen-color-success)] text-white',
  danger: 'bg-[var(--lumen-color-danger)] text-white',
  neutral: 'bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text)]',
};

const resolveThreshold = (threshold: number, width: number) => (
  threshold > 0 && threshold <= 1 ? width * threshold : Math.max(0, threshold)
);

export const SwipeActions = React.forwardRef<HTMLDivElement, SwipeActionsProps>(
  (
    {
      children,
      startActions = [],
      endActions = [],
      openSide,
      defaultOpenSide = null,
      onOpenChange,
      actionWidth = 72,
      threshold = 0.4,
      fullSwipe = false,
      fullSwipeThreshold = 0.72,
      disabled = false,
      closeOnAction = true,
      swipeIgnoreSelector = 'input, select, textarea, [contenteditable="true"], [data-swipe-actions-ignore]',
      contentClassName,
      className,
      style,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<DragState | null>(null);
    const suppressClickRef = useRef(false);
    const [internalOpenSide, setInternalOpenSide] = useState<SwipeActionsSide | null>(
      defaultOpenSide,
    );
    const [dragOffset, setDragOffset] = useState<number | null>(null);
    const controlled = openSide !== undefined;
    const currentOpenSide = controlled ? openSide : internalOpenSide;
    const resolvedActionWidth = Math.max(1, actionWidth);
    const startWidth = startActions.length * resolvedActionWidth;
    const endWidth = endActions.length * resolvedActionWidth;
    const restingOffset = currentOpenSide === 'start'
      ? startWidth
      : currentOpenSide === 'end'
        ? -endWidth
        : 0;
    const currentOffset = dragOffset ?? restingOffset;

    const setRootRef = useCallback((node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }, [forwardedRef]);

    const changeOpenSide = useCallback((side: SwipeActionsSide | null) => {
      if (!controlled) setInternalOpenSide(side);
      onOpenChange?.(side);
    }, [controlled, onOpenChange]);

    const resetDrag = useCallback(() => {
      dragRef.current = null;
      setDragOffset(null);
    }, []);

    useEffect(() => {
      if (
        (currentOpenSide === 'start' && startActions.length === 0)
        || (currentOpenSide === 'end' && endActions.length === 0)
      ) changeOpenSide(null);
    }, [changeOpenSide, currentOpenSide, endActions.length, startActions.length]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (
        event.defaultPrevented
        || disabled
        || event.pointerType !== 'touch'
        || (startActions.length === 0 && endActions.length === 0)
      ) return;
      const target = event.target as HTMLElement;
      if (target.closest('[data-swipe-actions-side]') || target.closest(swipeIgnoreSelector)) return;

      suppressClickRef.current = false;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: performance.now(),
        startOffset: restingOffset,
        offset: restingOffset,
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
      suppressClickRef.current = true;
      const rootWidth = rootRef.current?.clientWidth ?? 0;
      const minOffset = endWidth > 0 ? -endWidth : 0;
      const maxOffset = startWidth > 0 ? startWidth : 0;
      let nextOffset = drag.startOffset + deltaX;
      if (fullSwipe && rootWidth > 0) {
        nextOffset = Math.max(-rootWidth, Math.min(rootWidth, nextOffset));
      } else if (nextOffset < minOffset) {
        nextOffset = minOffset + (nextOffset - minOffset) * 0.2;
      } else if (nextOffset > maxOffset) {
        nextOffset = maxOffset + (nextOffset - maxOffset) * 0.2;
      }
      if (startActions.length === 0) nextOffset = Math.min(0, nextOffset);
      if (endActions.length === 0) nextOffset = Math.max(0, nextOffset);
      drag.offset = nextOffset;
      setDragOffset(nextOffset);
    };

    const runAction = (action: SwipeAction) => {
      if (action.disabled) return;
      action.onClick();
      if (closeOnAction) changeOpenSide(null);
    };

    const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const rootWidth = rootRef.current?.clientWidth ?? 0;
      const elapsed = Math.max(1, performance.now() - drag.startTime);
      const deltaX = event.clientX - drag.startX;
      const velocity = Math.abs(deltaX) / elapsed;
      const side = drag.offset > 0 ? 'start' : drag.offset < 0 ? 'end' : null;
      const actions = side === 'start' ? startActions : side === 'end' ? endActions : [];
      const fullSwipeDistance = rootWidth * Math.max(0, Math.min(1, fullSwipeThreshold));

      resetDrag();
      if (
        fullSwipe
        && side
        && actions[0]
        && !actions[0].disabled
        && Math.abs(drag.offset) >= fullSwipeDistance
      ) {
        runAction(actions[0]);
        return;
      }

      const sideWidth = side === 'start' ? startWidth : endWidth;
      const passedDistance = side !== null
        && Math.abs(drag.offset) >= resolveThreshold(threshold, sideWidth);
      const flickedFromClosed = drag.startOffset === 0 && velocity >= 0.45;
      changeOpenSide(side && (passedDistance || flickedFromClosed) ? side : null);
    };

    const renderActions = (side: SwipeActionsSide, actions: readonly SwipeAction[]) => (
      <div
        data-swipe-actions-side={side}
        className={cn(
          'pointer-events-none absolute inset-y-0 flex bg-[var(--lumen-color-surface-muted)]',
          side === 'start' ? 'left-0 justify-start' : 'right-0 justify-end',
          fullSwipe
            && currentOffset !== 0
            && (currentOffset > 0) === (side === 'start')
            && toneClassNames[actions[0]?.tone ?? 'neutral'],
        )}
        style={{
          width: fullSwipe
            && currentOffset !== 0
            && (currentOffset > 0) === (side === 'start')
            ? '100%'
            : `${actions.length * resolvedActionWidth}px`,
        }}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            disabled={action.disabled}
            aria-label={action.label}
            className={cn(
              'pointer-events-auto flex h-full shrink-0 flex-col items-center justify-center gap-1 px-2 text-[12px] font-medium leading-tight outline-none transition-[filter,opacity] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 disabled:opacity-45',
              toneClassNames[action.tone ?? 'neutral'],
              action.className,
            )}
            style={{ width: `${resolvedActionWidth}px` }}
            onFocus={() => changeOpenSide(side)}
            onClick={() => runAction(action)}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    );

    return (
      <div
        {...props}
        ref={setRootRef}
        data-ui="swipe-actions"
        data-open-side={currentOpenSide ?? undefined}
        data-dragging={dragOffset !== null || undefined}
        className={cn('relative min-w-0 overflow-hidden', className)}
        style={{ touchAction: disabled ? undefined : 'pan-y', ...style }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          if (!event.defaultPrevented) finishPointer(event);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          suppressClickRef.current = false;
          resetDrag();
        }}
        onClickCapture={(event) => {
          onClickCapture?.(event);
          if (event.defaultPrevented) return;
          const target = event.target as HTMLElement;
          if (target.closest('[data-swipe-actions-side]')) {
            suppressClickRef.current = false;
            return;
          }
          const content = target.closest('[data-swipe-actions-content]');
          if (suppressClickRef.current || (content && currentOpenSide)) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
            if (currentOpenSide) changeOpenSide(null);
          }
        }}
      >
        {startActions.length > 0 ? renderActions('start', startActions) : null}
        {endActions.length > 0 ? renderActions('end', endActions) : null}
        <div
          data-swipe-actions-content
          data-lumen-motion
          className={cn(
            'relative z-[1] bg-[var(--lumen-color-surface)] will-change-transform',
            dragOffset === null ? 'transition-transform duration-200 ease-out' : 'transition-none',
            contentClassName,
          )}
          style={{ transform: `translate3d(${currentOffset}px, 0, 0)` }}
        >
          {children}
        </div>
      </div>
    );
  },
);

SwipeActions.displayName = 'SwipeActions';
