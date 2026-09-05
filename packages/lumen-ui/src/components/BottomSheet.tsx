import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { OverlayScopeContext, useOverlayBehavior } from './useOverlayBehavior';

export interface BottomSheetProps {
  open: boolean;
  onRequestClose: () => void;
  onExited?: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  sheetId?: string;
  overlayId?: string;
  overlayClassName?: string;
  panelClassName?: string;
  inset?: boolean;
  maxWidth?: number | string;
  maxHeight?: number | string;
  persistent?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  closeOnSwipe?: boolean;
  showHandle?: boolean;
  lockScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  finalFocusRef?: React.RefObject<HTMLElement | null>;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

type DragState = {
  pointerId: number;
  startTime: number;
  startY: number;
  offset: number;
};

const toCssLength = (value?: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onRequestClose,
  onExited,
  children,
  title,
  description,
  sheetId,
  overlayId,
  overlayClassName = '',
  panelClassName = '',
  inset = false,
  maxWidth,
  maxHeight = 'calc(100dvh - var(--lumen-viewport-gutter))',
  persistent = false,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  closeOnSwipe = true,
  showHandle = true,
  lockScroll = true,
  initialFocusRef,
  finalFocusRef,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [mounted, setMounted] = useState(open);
  const [cachedChildren, setCachedChildren] = useState<React.ReactNode>(children);
  const [cachedTitle, setCachedTitle] = useState<React.ReactNode>(title);
  const [cachedDescription, setCachedDescription] = useState<React.ReactNode>(description);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const pointerStartedInsideRef = useRef(false);
  const exitCompletedRef = useRef(false);
  const generatedTitleId = useId();
  const generatedDescriptionId = useId();
  const dismissable = open && !persistent;
  const { requestCloseIfTopmost, scopeId, viewportStyle, zIndex } =
    useOverlayBehavior({
      enabled: mounted,
      dismissable,
      containerRef: panelRef,
      initialFocusRef,
      finalFocusRef,
      closeOnEscape: closeOnEscape && !persistent,
      lockScroll,
      onRequestClose,
    });

  useEffect(() => {
    if (!open) return;
    exitCompletedRef.current = false;
    setMounted(true);
    setCachedChildren(children);
    setCachedTitle(title);
    setCachedDescription(description);
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
    const timer = window.setTimeout(finishExit, 260);
    return () => window.clearTimeout(timer);
  }, [finishExit, mounted, open]);

  const handleAnimationEnd = useCallback((event: React.AnimationEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget || open) return;
    finishExit();
  }, [finishExit, open]);

  const resetDrag = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    setDragOffset(0);
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dismissable || !closeOnSwipe || event.pointerType !== 'touch') return;
    dragRef.current = {
      pointerId: event.pointerId,
      startTime: performance.now(),
      startY: event.clientY,
      offset: 0,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [closeOnSwipe, dismissable]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const nextOffset = Math.max(0, event.clientY - drag.startY);
    if (nextOffset < 4) return;
    event.preventDefault();
    drag.offset = nextOffset;
    setDragging(true);
    setDragOffset(nextOffset);
  }, []);

  const handlePointerEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const panelHeight = panelRef.current?.getBoundingClientRect().height || 320;
    const elapsed = Math.max(1, performance.now() - drag.startTime);
    const shouldClose =
      drag.offset >= Math.min(96, panelHeight * 0.25) ||
      drag.offset / elapsed >= 0.5;
    resetDrag();
    if (shouldClose) requestCloseIfTopmost();
  }, [requestCloseIfTopmost, resetDrag]);

  if (!mounted || typeof document === 'undefined') return null;

  const isClosing = mounted && !open;
  const displayChildren = isClosing ? cachedChildren : children;
  const displayTitle = isClosing ? cachedTitle : title;
  const displayDescription = isClosing ? cachedDescription : description;
  const hasTitle = displayTitle !== undefined && displayTitle !== null;
  const hasDescription = displayDescription !== undefined && displayDescription !== null;
  const resolvedAriaLabelledBy =
    ariaLabelledBy ?? (hasTitle && !ariaLabel ? generatedTitleId : undefined);
  const resolvedAriaDescribedBy =
    ariaDescribedBy ?? (hasDescription ? generatedDescriptionId : undefined);
  const sheetState = isClosing ? 'closing' : 'open';

  return createPortal(
    <OverlayScopeContext.Provider value={scopeId}>
      <div
        data-bottom-sheet-overlay={overlayId || sheetId}
        data-bottom-sheet-state={sheetState}
        data-lumen-motion
        className={`lumen-bottom-sheet-overlay fixed inset-0 z-[100] flex items-end justify-center overflow-hidden bg-[var(--lumen-color-overlay)] backdrop-blur-[2px] ${overlayClassName}`.trim()}
        style={{ ...viewportStyle, zIndex }}
        onPointerDown={(event) => {
          pointerStartedInsideRef.current = event.target !== event.currentTarget;
        }}
        onClick={
          closeOnOverlayClick && !persistent
            ? (event) => {
                const startedInside = pointerStartedInsideRef.current;
                pointerStartedInsideRef.current = false;
                if (!startedInside && event.target === event.currentTarget) {
                  requestCloseIfTopmost();
                }
              }
            : undefined
        }
      >
        <aside
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={resolvedAriaLabelledBy}
          aria-describedby={resolvedAriaDescribedBy}
          tabIndex={-1}
          data-bottom-sheet={sheetId}
          data-bottom-sheet-state={sheetState}
          data-bottom-sheet-inset={inset || undefined}
          data-bottom-sheet-dragging={dragging || undefined}
          data-lumen-motion
          className={`lumen-bottom-sheet-panel flex w-full flex-col overflow-hidden rounded-t-[16px] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text)] shadow-[0_-8px_32px_var(--lumen-color-shadow)] ${
            inset ? 'pad:w-[70%]' : ''
          } ${panelClassName}`.trim()}
          style={{
            maxHeight: toCssLength(maxHeight),
            maxWidth: toCssLength(maxWidth),
            transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
            transition: dragging ? 'none' : 'transform 180ms ease-out',
          }}
          onClick={(event) => event.stopPropagation()}
          onAnimationEnd={handleAnimationEnd}
        >
          {showHandle ? (
            <div
              data-bottom-sheet-handle
              aria-hidden="true"
              className="flex h-7 shrink-0 touch-none items-center justify-center"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={resetDrag}
            >
              <span className="h-1 w-9 rounded-full bg-[var(--lumen-color-border-strong)]" />
            </div>
          ) : null}
          {hasTitle || hasDescription ? (
            <header
              className={`shrink-0 px-4 pb-3 pad:px-5 ${showHandle ? '' : 'pt-4 pad:pt-5'}`.trim()}
              data-bottom-sheet-header
            >
              {hasTitle ? (
                <div
                  id={generatedTitleId}
                  data-bottom-sheet-title
                  className="text-[16px] font-semibold leading-6"
                >
                  {displayTitle}
                </div>
              ) : null}
              {hasDescription ? (
                <div
                  id={generatedDescriptionId}
                  data-bottom-sheet-description
                  className="mt-1 text-[14px] leading-5 text-[var(--lumen-color-text-secondary)]"
                >
                  {displayDescription}
                </div>
              ) : null}
            </header>
          ) : null}
          <div
            data-bottom-sheet-content
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"
          >
            {displayChildren}
          </div>
        </aside>
      </div>
    </OverlayScopeContext.Provider>,
    document.body,
  );
};
