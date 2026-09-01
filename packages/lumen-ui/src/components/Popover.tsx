import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from './classNames';
import {
  announceFloatingLayerOpen,
  FLOATING_LAYER_OPEN_EVENT,
} from './floatingEvents';
import {
  computePosition,
  type TooltipPlacement,
} from './tooltip-positions';

export type PopoverPlacement = TooltipPlacement;
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverRenderState {
  open: boolean;
  popoverId: string;
  close: () => void;
  toggle: () => void;
}

export interface PopoverContentState {
  open: boolean;
  close: () => void;
}

export interface PopoverProps {
  trigger: (state: PopoverRenderState) => React.ReactNode;
  children: React.ReactNode | ((state: PopoverContentState) => React.ReactNode);
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  offset?: number;
  closeDelayMs?: number;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  contentClassName?: string;
  contentRole?: React.AriaRole;
  ariaLabel?: string;
}

type PopoverPhase = 'closed' | 'opening' | 'open' | 'closing';

const OPEN_ANIMATION_DELAY_MS = 16;
const DEFAULT_CLOSE_DELAY_MS = 120;
const VIEWPORT_PADDING = 8;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

const getTransformOriginClassName = (
  placement: PopoverPlacement,
  align: PopoverAlign,
) => {
  if (placement === 'top') {
    return align === 'start' ? 'origin-bottom-left' : align === 'end' ? 'origin-bottom-right' : 'origin-bottom';
  }
  if (placement === 'bottom') {
    return align === 'start' ? 'origin-top-left' : align === 'end' ? 'origin-top-right' : 'origin-top';
  }
  if (placement === 'left') return 'origin-right';
  return 'origin-left';
};

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom',
  align = 'center',
  offset = 8,
  closeDelayMs = DEFAULT_CLOSE_DELAY_MS,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  className,
  contentClassName,
  contentRole = 'dialog',
  ariaLabel,
}) => {
  const popoverId = useId();
  const controlled = typeof open === 'boolean';
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const desiredOpen = controlled ? open : internalOpen;
  const [phase, setPhase] = useState<PopoverPhase>(defaultOpen || open ? 'open' : 'closed');
  const [actualPlacement, setActualPlacement] = useState(placement);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({
    left: -9999,
    position: 'fixed',
    top: -9999,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const hasMountedContentRef = useRef(defaultOpen || Boolean(open));
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const mounted = phase !== 'closed';
  const triggerOpen = desiredOpen && phase !== 'closing';

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const requestOpenChange = useCallback((nextOpen: boolean) => {
    if (!controlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (nextOpen) announceFloatingLayerOpen(popoverId);
  }, [controlled, onOpenChange, popoverId]);

  const close = useCallback(() => requestOpenChange(false), [requestOpenChange]);
  const toggle = useCallback(
    () => requestOpenChange(!desiredOpen),
    [desiredOpen, requestOpenChange],
  );

  const closeImmediately = useCallback(() => {
    clearTimers();
    hasMountedContentRef.current = false;
    if (!controlled) setInternalOpen(false);
    setPhase('closed');
    onOpenChange?.(false);
  }, [clearTimers, controlled, onOpenChange]);

  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    const popoverElement = popoverRef.current;
    if (!container || !popoverElement) return;

    const triggerElement = container.firstElementChild;
    const triggerRect = triggerElement instanceof HTMLElement
      ? triggerElement.getBoundingClientRect()
      : container.getBoundingClientRect();
    const width = popoverElement.offsetWidth || 280;
    const height = popoverElement.offsetHeight || 160;
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const result = computePosition(
      triggerRect,
      { width, height },
      placement,
      offset,
      VIEWPORT_PADDING,
      viewport,
    );
    let left = result.x;
    let top = result.y;

    if (result.actualPlacement === 'top' || result.actualPlacement === 'bottom') {
      if (align === 'start') left = triggerRect.left;
      if (align === 'end') left = triggerRect.right - width;
      left = clamp(left, VIEWPORT_PADDING, viewport.width - width - VIEWPORT_PADDING);
    } else {
      if (align === 'start') top = triggerRect.top;
      if (align === 'end') top = triggerRect.bottom - height;
      top = clamp(top, VIEWPORT_PADDING, viewport.height - height - VIEWPORT_PADDING);
    }

    setActualPlacement(result.actualPlacement);
    setPopoverStyle({
      left,
      top,
      position: 'fixed',
      maxHeight: `calc(100vh - ${VIEWPORT_PADDING * 2}px)`,
      maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
    });
  }, [align, offset, placement]);

  useEffect(() => {
    clearTimers();
    if (desiredOpen) {
      hasMountedContentRef.current = true;
      triggerElementRef.current = containerRef.current?.firstElementChild instanceof HTMLElement
        ? containerRef.current.firstElementChild
        : null;
      setPhase('opening');
      openTimerRef.current = setTimeout(() => {
        setPhase('open');
        openTimerRef.current = null;
      }, OPEN_ANIMATION_DELAY_MS);
      return clearTimers;
    }
    if (hasMountedContentRef.current) {
      setPhase('closing');
      closeTimerRef.current = setTimeout(() => {
        setPhase('closed');
        hasMountedContentRef.current = false;
        closeTimerRef.current = null;
      }, closeDelayMs);
    }
    return clearTimers;
  }, [clearTimers, closeDelayMs, desiredOpen]);

  useEffect(() => {
    const handleAnotherLayerOpen = (event: Event) => {
      const openedLayerId = (event as CustomEvent<string>).detail;
      if (openedLayerId && openedLayerId !== popoverId && desiredOpen) {
        closeImmediately();
      }
    };
    window.addEventListener(FLOATING_LAYER_OPEN_EVENT, handleAnotherLayerOpen);
    return () => window.removeEventListener(FLOATING_LAYER_OPEN_EVENT, handleAnotherLayerOpen);
  }, [closeImmediately, desiredOpen, popoverId]);

  useEffect(() => {
    if (!mounted) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target) || containerRef.current?.contains(target)) return;
      if (closeOnOutsideClick) close();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !closeOnEscape) return;
      event.preventDefault();
      close();
      triggerElementRef.current?.focus();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, closeOnEscape, closeOnOutsideClick, mounted]);

  useLayoutEffect(() => {
    if (mounted) updatePosition();
  }, [mounted, phase, updatePosition]);

  useEffect(() => {
    if (!mounted) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [mounted, updatePosition]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)}>
      {trigger({ open: triggerOpen, popoverId, close, toggle })}
      {mounted && createPortal(
        <div
          id={popoverId}
          ref={popoverRef}
          role={contentRole}
          aria-label={ariaLabel}
          data-state={phase}
          data-placement={actualPlacement}
          style={popoverStyle}
          className="z-50 outline-none"
        >
          <div
            data-lumen-motion
            data-ui="popover"
            className={cn(
              'max-h-[inherit] max-w-[inherit] overflow-auto rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] p-4 shadow-[var(--lumen-shadow-dropdown)]',
              getTransformOriginClassName(actualPlacement, align),
              contentClassName,
            )}
            style={{
              animation: phase === 'closing'
                ? 'lumen-dropdown-out 0.12s ease-in forwards'
                : 'lumen-dropdown-in 0.12s ease-out',
            }}
          >
            {typeof children === 'function'
              ? children({ open: triggerOpen, close })
              : children}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
