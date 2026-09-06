import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, LoaderCircle } from 'lucide-react';
import { useLumenLocale } from '../../i18n';
import { cn } from '../classNames';

export type PullToRefreshState = 'idle' | 'pulling' | 'ready' | 'refreshing';

export interface PullToRefreshProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onRefresh'> {
  /** 下拉距离达到阈值并松手后触发。返回 Promise 时，组件会保持刷新状态直至其结束。 */
  onRefresh: () => void | Promise<void>;
  /** 禁用下拉刷新手势。 */
  disabled?: boolean;
  /** 触发刷新所需的可见下拉距离，单位为像素。 */
  threshold?: number;
  /** 内容可被下拉的最大可见距离，单位为像素。 */
  maxPullDistance?: number;
  /** 覆盖“下拉刷新”状态文案。 */
  pullingText?: React.ReactNode;
  /** 覆盖“释放刷新”状态文案。 */
  releaseText?: React.ReactNode;
  /** 覆盖“正在刷新”状态文案。 */
  refreshingText?: React.ReactNode;
}

type Gesture = {
  axis: 'horizontal' | 'vertical' | null;
  startX: number;
  startY: number;
};

const GESTURE_LOCK_DISTANCE = 6;
const PULL_RESISTANCE = 0.5;

export const PullToRefresh = React.forwardRef<
  HTMLDivElement,
  PullToRefreshProps
>(
  (
    {
      onRefresh,
      disabled = false,
      threshold = 64,
      maxPullDistance = 128,
      pullingText,
      releaseText,
      refreshingText,
      children,
      className,
      style,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      ...props
    },
    forwardedRef,
  ) => {
    const locale = useLumenLocale();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const gestureRef = useRef<Gesture | null>(null);
    const mountedRef = useRef(true);
    const [state, setState] = useState<PullToRefreshState>('idle');
    const [pullDistance, setPullDistance] = useState(0);
    const safeThreshold = Math.max(1, threshold);
    const safeMaxPullDistance = Math.max(safeThreshold, maxPullDistance);

    const setContainerRef = useCallback(
      (element: HTMLDivElement | null) => {
        containerRef.current = element;
        if (typeof forwardedRef === 'function') {
          forwardedRef(element);
        } else if (forwardedRef) {
          forwardedRef.current = element;
        }
      },
      [forwardedRef],
    );

    const reset = useCallback(() => {
      gestureRef.current = null;
      setPullDistance(0);
      setState('idle');
    }, []);

    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    useEffect(() => {
      if (disabled && state !== 'refreshing') reset();
    }, [disabled, reset, state]);

    const startRefresh = useCallback(() => {
      gestureRef.current = null;
      setPullDistance(safeThreshold);
      setState('refreshing');

      let result: void | Promise<void>;
      try {
        result = onRefresh();
      } catch (error) {
        reset();
        throw error;
      }

      const finish = () => {
        if (mountedRef.current) reset();
      };
      void Promise.resolve(result).then(finish, finish);
    }, [onRefresh, reset, safeThreshold]);

    const handleTouchStart = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        onTouchStart?.(event);
        const touch = event.touches[0];
        if (
          event.defaultPrevented
          || disabled
          || state === 'refreshing'
          || event.touches.length !== 1
          || !touch
          || (containerRef.current?.scrollTop ?? 0) > 0
        ) {
          gestureRef.current = null;
          return;
        }

        gestureRef.current = {
          axis: null,
          startX: touch.clientX,
          startY: touch.clientY,
        };
      },
      [disabled, onTouchStart, state],
    );

    const handleTouchMove = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        onTouchMove?.(event);
        const gesture = gestureRef.current;
        const touch = event.touches[0];
        if (event.defaultPrevented || !gesture || !touch) return;

        const deltaX = touch.clientX - gesture.startX;
        const deltaY = touch.clientY - gesture.startY;

        if (
          !gesture.axis
          && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= GESTURE_LOCK_DISTANCE
        ) {
          gesture.axis = Math.abs(deltaY) > Math.abs(deltaX)
            ? 'vertical'
            : 'horizontal';
        }

        if (gesture.axis === 'horizontal') {
          reset();
          return;
        }
        if (gesture.axis !== 'vertical') return;
        if (deltaY <= 0 || (containerRef.current?.scrollTop ?? 0) > 0) {
          reset();
          return;
        }

        event.preventDefault();
        const nextDistance = Math.min(
          safeMaxPullDistance,
          deltaY * PULL_RESISTANCE,
        );
        setPullDistance(nextDistance);
        setState(nextDistance >= safeThreshold ? 'ready' : 'pulling');
      },
      [onTouchMove, reset, safeMaxPullDistance, safeThreshold],
    );

    const handleTouchEnd = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        onTouchEnd?.(event);
        if (state === 'ready') {
          startRefresh();
        } else if (state !== 'refreshing') {
          reset();
        }
      },
      [onTouchEnd, reset, startRefresh, state],
    );

    const handleTouchCancel = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        onTouchCancel?.(event);
        if (state !== 'refreshing') reset();
      },
      [onTouchCancel, reset, state],
    );

    const statusText = state === 'refreshing'
      ? (refreshingText ?? locale.pullToRefresh.refreshing)
      : state === 'ready'
        ? (releaseText ?? locale.pullToRefresh.release)
        : (pullingText ?? locale.pullToRefresh.pulling);
    const transition = gestureRef.current
      ? 'none'
      : 'transform 200ms ease-out, opacity 160ms ease-out';

    return (
      <div
        {...props}
        ref={setContainerRef}
        aria-busy={state === 'refreshing' || undefined}
        data-ui="pull-to-refresh"
        data-state={state}
        className={cn(
          'relative overflow-y-auto overscroll-y-contain',
          className,
        )}
        style={{ scrollbarGutter: 'stable', ...style }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div
          role="status"
          aria-live="polite"
          data-pull-to-refresh-indicator
          className="pointer-events-none absolute left-1/2 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lumen-color-surface)] text-[var(--lumen-color-primary)] shadow-[0_3px_8px_var(--lumen-color-shadow),0_10px_24px_var(--lumen-color-shadow)]"
          style={{
            opacity: state === 'idle' ? 0 : 1,
            transform: `translate3d(-50%, ${pullDistance - 48}px, 0) scale(${state === 'idle' ? 0.8 : 1})`,
            transition,
          }}
        >
          {state === 'refreshing' ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" size={19} />
          ) : (
            <ArrowDown
              aria-hidden="true"
              className={cn('transition-transform', state === 'ready' && 'rotate-180')}
              size={19}
            />
          )}
          <span className="sr-only">{statusText}</span>
        </div>
        <div
          data-pull-to-refresh-content
        >
          {children}
        </div>
      </div>
    );
  },
);

PullToRefresh.displayName = 'PullToRefresh';
