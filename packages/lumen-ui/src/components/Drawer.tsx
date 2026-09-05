import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { OverlayScopeContext, useOverlayBehavior } from './useOverlayBehavior';

export type DrawerPlacement = 'left' | 'right';

export interface DrawerProps {
  open: boolean;
  onRequestClose: () => void;
  onExited?: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  drawerId?: string;
  overlayId?: string;
  overlayClassName?: string;
  panelClassName?: string;
  placement?: DrawerPlacement;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  closeOnSwipe?: boolean;
  lockScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  finalFocusRef?: React.RefObject<HTMLElement | null>;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  overlayDataAttributes?: Record<string, string | boolean>;
  panelDataAttributes?: Record<string, string | boolean>;
}

const overlayBaseClassName =
  'fixed inset-0 z-[100] flex items-stretch overflow-hidden bg-[var(--lumen-color-overlay)] backdrop-blur-[2px]';

const buildDataAttributes = (attributes?: Record<string, string | boolean>) =>
  Object.fromEntries(
    Object.entries(attributes ?? {}).map(([key, value]) => [
      `data-${key}`,
      value,
    ]),
  );

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onRequestClose,
  onExited,
  children,
  title,
  description,
  drawerId,
  overlayId,
  overlayClassName = '',
  panelClassName = '',
  placement = 'right',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  closeOnSwipe = false,
  lockScroll = true,
  initialFocusRef,
  finalFocusRef,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  overlayDataAttributes,
  panelDataAttributes,
}) => {
  const [mounted, setMounted] = useState(open);
  const [cachedChildren, setCachedChildren] =
    useState<React.ReactNode>(children);
  const [cachedTitle, setCachedTitle] = useState<React.ReactNode>(title);
  const [cachedDescription, setCachedDescription] =
    useState<React.ReactNode>(description);
  const exitCompletedRef = useRef(false);
  const panelRef = useRef<HTMLElement>(null);
  const pointerStartedInsideRef = useRef(false);
  const generatedTitleId = useId();
  const generatedDescriptionId = useId();
  const dragRef = useRef<{
    axis: 'horizontal' | 'vertical' | null;
    pointerId: number;
    startTime: number;
    startX: number;
    startY: number;
    offset: number;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const { requestCloseIfTopmost, scopeId, viewportStyle, zIndex } =
    useOverlayBehavior({
      enabled: mounted,
      dismissable: open,
      containerRef: panelRef,
      initialFocusRef,
      finalFocusRef,
      closeOnEscape,
      lockScroll,
      onRequestClose,
    });

  useEffect(() => {
    if (open) {
      exitCompletedRef.current = false;
      setMounted(true);
      setCachedChildren(children);
      setCachedTitle(title);
      setCachedDescription(description);
    }
  }, [children, description, open, title]);

  const finishExit = useCallback(() => {
    if (exitCompletedRef.current) return;
    exitCompletedRef.current = true;
    setMounted(false);
    setCachedChildren(null);
    onExited?.();
  }, [onExited]);

  useEffect(() => {
    if (!mounted || open) return undefined;

    const timer = window.setTimeout(finishExit, 310);
    return () => window.clearTimeout(timer);
  }, [finishExit, mounted, open]);

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget || open) return;
      finishExit();
    },
    [finishExit, open],
  );

  const resetDrag = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    setDragOffset(0);
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!open || !closeOnSwipe || event.pointerType !== 'touch') return;
      dragRef.current = {
        axis: null,
        pointerId: event.pointerId,
        startTime: performance.now(),
        startX: event.clientX,
        startY: event.clientY,
        offset: 0,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [closeOnSwipe, open],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (!drag.axis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 8) {
        drag.axis =
          Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
      }
      if (drag.axis !== 'horizontal') return;

      event.preventDefault();
      setDragging(true);
      const panelWidth = panelRef.current?.getBoundingClientRect().width || 320;
      const nextOffset = Math.min(
        panelWidth,
        Math.max(0, placement === 'right' ? deltaX : -deltaX),
      );
      drag.offset = nextOffset;
      setDragOffset(nextOffset);
    },
    [placement],
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const panelWidth = panelRef.current?.getBoundingClientRect().width || 320;
      const elapsed = Math.max(1, performance.now() - drag.startTime);
      const shouldClose =
        drag.axis === 'horizontal' &&
        (drag.offset >= Math.min(80, panelWidth * 0.25) ||
          drag.offset / elapsed >= 0.5);
      resetDrag();
      if (shouldClose) requestCloseIfTopmost();
    },
    [requestCloseIfTopmost, resetDrag],
  );

  if (!mounted || typeof document === 'undefined') return null;

  const isClosing = mounted && !open;
  const displayChildren = isClosing ? cachedChildren : children;
  const displayTitle = isClosing ? cachedTitle : title;
  const displayDescription = isClosing ? cachedDescription : description;
  const hasTitle = displayTitle !== undefined && displayTitle !== null;
  const hasDescription =
    displayDescription !== undefined && displayDescription !== null;
  const resolvedAriaLabelledBy =
    ariaLabelledBy ?? (hasTitle && !ariaLabel ? generatedTitleId : undefined);
  const resolvedAriaDescribedBy =
    ariaDescribedBy ?? (hasDescription ? generatedDescriptionId : undefined);
  const drawerState = isClosing ? 'closing' : 'open';

  return createPortal(
    <OverlayScopeContext.Provider value={scopeId}>
      <div
        data-drawer-overlay={overlayId || drawerId}
        data-drawer-state={drawerState}
        data-lumen-motion
        className={`${overlayBaseClassName} lumen-drawer-overlay ${
          placement === 'left' ? 'justify-start' : 'justify-end'
        } ${overlayClassName}`.trim()}
        style={{ ...viewportStyle, zIndex }}
        onPointerDown={(event) => {
          pointerStartedInsideRef.current =
            event.target !== event.currentTarget;
        }}
        onClick={
          closeOnOverlayClick
            ? (event) => {
                const startedInside = pointerStartedInsideRef.current;
                pointerStartedInsideRef.current = false;
                if (!startedInside && event.target === event.currentTarget) {
                  requestCloseIfTopmost();
                }
              }
            : undefined
        }
        {...buildDataAttributes(overlayDataAttributes)}
      >
        <aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={resolvedAriaLabelledBy}
          aria-describedby={resolvedAriaDescribedBy}
          tabIndex={-1}
          data-drawer={drawerId}
          data-drawer-placement={placement}
          data-drawer-state={drawerState}
          data-drawer-dragging={dragging || undefined}
          data-lumen-motion
          className={`lumen-drawer-panel h-full max-w-full overflow-y-auto ${panelClassName}`.trim()}
          style={
            dragOffset > 0
              ? {
                  transform: `translateX(${
                    placement === 'right' ? dragOffset : -dragOffset
                  }px)`,
                  transition: dragging ? 'none' : 'transform 180ms ease-out',
                }
              : { touchAction: 'pan-y' }
          }
          onClick={(event) => event.stopPropagation()}
          onAnimationEnd={handleAnimationEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={resetDrag}
          {...buildDataAttributes(panelDataAttributes)}
        >
          {hasTitle || hasDescription ? (
            <div data-drawer-header>
              {hasTitle ? (
                <div
                  id={generatedTitleId}
                  data-drawer-title
                  className="text-[16px] font-semibold leading-6 text-[var(--lumen-color-text)]"
                >
                  {displayTitle}
                </div>
              ) : null}
              {hasDescription ? (
                <div
                  id={generatedDescriptionId}
                  data-drawer-description
                  className="mt-2 text-[14px] leading-6 text-[var(--lumen-color-text-secondary)]"
                >
                  {displayDescription}
                </div>
              ) : null}
            </div>
          ) : null}
          {displayChildren}
        </aside>
      </div>
    </OverlayScopeContext.Provider>,
    document.body,
  );
};
