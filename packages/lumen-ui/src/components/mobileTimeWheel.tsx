import React, { useEffect, useId, useMemo, useRef } from 'react';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CENTER_OFFSET = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;
const pad = (value: number) => String(value).padStart(2, '0');

interface TimeWheelColumnProps {
  label: string;
  values: string[];
  value: string;
  onChange: (value: string) => void;
}

const TimeWheelColumn: React.FC<TimeWheelColumnProps> = ({
  label,
  values,
  value,
  onChange,
}) => {
  const id = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const activeIndexRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const motionAnimationRef = useRef<Animation | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureRef = useRef<{
    pointerId: number;
    lastY: number;
    lastTime: number;
    velocity: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const selectedIndex = Math.max(0, values.indexOf(value));
  const maxPosition = (values.length - 1) * ITEM_HEIGHT;

  const readRenderedPosition = () => {
    const track = trackRef.current;
    if (!track) return positionRef.current;
    const transform = window.getComputedStyle(track).transform;
    if (!transform || transform === 'none') return positionRef.current;
    const values = transform.match(/matrix(?:3d)?\(([^)]+)\)/)?.[1]
      ?.split(',')
      .map(Number);
    const translateY = values?.length === 16 ? values[13] : values?.[5];
    return typeof translateY === 'number' && Number.isFinite(translateY)
      ? CENTER_OFFSET - translateY
      : positionRef.current;
  };

  const cancelMotion = () => {
    if (motionAnimationRef.current) {
      const renderedPosition = readRenderedPosition();
      motionAnimationRef.current.cancel();
      motionAnimationRef.current = null;
      renderPosition(renderedPosition);
    }
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  };

  const markActiveIndex = (index: number) => {
    activeIndexRef.current = index;
  };

  const renderPosition = (position: number) => {
    const nextPosition = Math.min(maxPosition, Math.max(0, position));
    positionRef.current = nextPosition;
    if (trackRef.current) {
      trackRef.current.style.transform =
        `translate3d(0, ${CENTER_OFFSET - nextPosition}px, 0)`;
    }
    markActiveIndex(Math.min(
      values.length - 1,
      Math.max(0, Math.round(nextPosition / ITEM_HEIGHT)),
    ));
    return nextPosition;
  };

  const commitIndex = (index: number) => {
    const nextValue = values[index];
    if (nextValue !== undefined && nextValue !== value) onChange(nextValue);
  };

  const animateToIndex = (
    index: number,
    commit = true,
    requestedDuration?: number,
    easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  ) => {
    cancelMotion();
    const start = positionRef.current;
    const target = index * ITEM_HEIGHT;
    const distance = target - start;
    const startedAt = performance.now();
    const duration = requestedDuration ??
      Math.min(360, Math.max(180, Math.abs(distance) * 2.5));

    if (Math.abs(distance) < 0.5) {
      renderPosition(target);
      if (commit) commitIndex(index);
      return;
    }

    const track = trackRef.current;
    if (track && typeof track.animate === 'function') {
      const targetTransform = `translate3d(0, ${CENTER_OFFSET - target}px, 0)`;
      const animation = track.animate(
        [
          { transform: `translate3d(0, ${CENTER_OFFSET - start}px, 0)` },
          { transform: targetTransform },
        ],
        { duration, easing, fill: 'forwards' },
      );
      motionAnimationRef.current = animation;
      animation.onfinish = () => {
        if (motionAnimationRef.current !== animation) return;
        motionAnimationRef.current = null;
        track.style.transform = targetTransform;
        positionRef.current = target;
        markActiveIndex(index);
        if (commit) commitIndex(index);
      };
      return;
    }

    const advance = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      renderPosition(start + distance * eased);
      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(advance);
      } else {
        animationFrameRef.current = null;
        if (commit) commitIndex(index);
      }
    };
    animationFrameRef.current = window.requestAnimationFrame(advance);
  };

  const settle = () => {
    const index = Math.min(
      values.length - 1,
      Math.max(0, Math.round(positionRef.current / ITEM_HEIGHT)),
    );
    animateToIndex(index);
  };

  const startInertia = (initialVelocity: number) => {
    const velocity = Math.max(-3.4, Math.min(3.4, initialVelocity));
    const speed = Math.abs(velocity);
    const duration = Math.min(1450, 560 + speed * 260);
    const projectedPosition = Math.min(
      maxPosition,
      Math.max(0, positionRef.current + velocity * duration * 0.5),
    );
    const index = Math.min(
      values.length - 1,
      Math.max(0, Math.round(projectedPosition / ITEM_HEIGHT)),
    );
    animateToIndex(
      index,
      true,
      duration,
      'cubic-bezier(0.12, 0.72, 0.18, 1)',
    );
  };

  useEffect(() => {
    activeIndexRef.current = selectedIndex;
    const frame = window.requestAnimationFrame(() => {
      renderPosition(selectedIndex * ITEM_HEIGHT);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => cancelMotion(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-w-0 flex-1">
      <div className="pb-2 text-center text-[14px] font-medium text-[var(--lumen-color-text-secondary)]">
        {label}
      </div>
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1 top-1/2 h-11 -translate-y-1/2 rounded-[var(--lumen-radius-control)] bg-[var(--lumen-color-primary-soft)]"
        />
        <div
          ref={viewportRef}
          role="listbox"
          aria-label={label}
          aria-activedescendant={`${id}-${selectedIndex}`}
          tabIndex={0}
          data-mobile-time-wheel-column
          className="relative overflow-hidden overscroll-contain outline-none"
          style={{ height: WHEEL_HEIGHT, touchAction: 'none' }}
          onWheel={(event) => {
            event.preventDefault();
            cancelMotion();
            renderPosition(positionRef.current + event.deltaY);
            settleTimerRef.current = setTimeout(settle, 160);
          }}
          onPointerDown={(event) => {
            cancelMotion();
            suppressClickRef.current = false;
            gestureRef.current = {
              pointerId: event.pointerId,
              lastY: event.clientY,
              lastTime: performance.now(),
              velocity: 0,
              moved: false,
            };
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            const gesture = gestureRef.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            event.preventDefault();
            const time = performance.now();
            const delta = gesture.lastY - event.clientY;
            const elapsed = Math.max(1, time - gesture.lastTime);
            renderPosition(positionRef.current + delta);
            gesture.velocity = gesture.velocity * 0.62 + (delta / elapsed) * 0.38;
            gesture.lastY = event.clientY;
            gesture.lastTime = time;
            if (Math.abs(delta) > 1) {
              gesture.moved = true;
              suppressClickRef.current = true;
            }
          }}
          onPointerUp={(event) => {
            const gesture = gestureRef.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            gestureRef.current = null;
            event.currentTarget.releasePointerCapture?.(event.pointerId);
            if (gesture.moved && Math.abs(gesture.velocity) >= 0.025) {
              startInertia(gesture.velocity);
            } else {
              settle();
            }
          }}
          onPointerCancel={() => {
            gestureRef.current = null;
            settle();
          }}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
            event.preventDefault();
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            const index = Math.min(
              values.length - 1,
              Math.max(0, activeIndexRef.current + direction),
            );
            animateToIndex(index);
          }}
        >
          <div
            ref={trackRef}
            className="will-change-transform"
            style={{
              backfaceVisibility: 'hidden',
              contain: 'layout paint style',
            }}
          >
            {values.map((item, index) => {
              const selected = index === selectedIndex;
              return (
                <button
                  id={`${id}-${index}`}
                  key={item}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    if (suppressClickRef.current) {
                      suppressClickRef.current = false;
                      return;
                    }
                    animateToIndex(index);
                  }}
                  className="flex w-full items-center justify-center text-[18px] font-medium tabular-nums text-[var(--lumen-color-text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--lumen-color-primary)]/25"
                  style={{ height: ITEM_HEIGHT }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-11 bg-gradient-to-b from-[var(--lumen-color-surface)] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-11 bg-gradient-to-t from-[var(--lumen-color-surface)] to-transparent"
        />
      </div>
    </div>
  );
};

interface MobileTimeWheelProps {
  hour: string;
  minute: string;
  second?: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onSecondChange?: (value: string) => void;
  precision?: 'minute' | 'second';
  minuteStep?: number;
  labels: { hour: string; minute: string; second: string };
}

export const MobileTimeWheel: React.FC<MobileTimeWheelProps> = ({
  hour,
  minute,
  second = '00',
  onHourChange,
  onMinuteChange,
  onSecondChange,
  precision = 'minute',
  minuteStep = 1,
  labels,
}) => {
  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, item) => pad(item)),
    [],
  );
  const minutes = useMemo(() => {
    const step = Math.max(1, minuteStep);
    return Array.from({ length: Math.ceil(60 / step) }, (_, index) =>
      pad(index * step),
    );
  }, [minuteStep]);
  const seconds = useMemo(
    () => Array.from({ length: 60 }, (_, item) => pad(item)),
    [],
  );

  return (
    <div data-mobile-time-wheel className="flex gap-2 px-4 pb-3 pt-4">
      <TimeWheelColumn
        label={labels.hour}
        values={hours}
        value={hour}
        onChange={onHourChange}
      />
      <TimeWheelColumn
        label={labels.minute}
        values={minutes}
        value={minute}
        onChange={onMinuteChange}
      />
      {precision === 'second' ? (
        <TimeWheelColumn
          label={labels.second}
          values={seconds}
          value={second}
          onChange={onSecondChange ?? (() => undefined)}
        />
      ) : null}
    </div>
  );
};
