import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { OverlayScopeContext, useOverlayBehavior } from './useOverlayBehavior';

export interface ModalProps {
  open: boolean;
  onRequestClose: () => void;
  onExited?: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  modalId?: string;
  overlayId?: string;
  overlayClassName?: string;
  panelClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  finalFocusRef?: React.RefObject<HTMLElement | null>;
  role?: 'dialog' | 'alertdialog';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const overlayBaseClassName =
  'fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-[var(--lumen-color-overlay)] p-3 backdrop-blur-[2px] pad:p-4 l:p-5 xl:p-6';

export const Modal: React.FC<ModalProps> = ({
  open,
  onRequestClose,
  onExited,
  children,
  title,
  description,
  modalId,
  overlayId,
  overlayClassName = '',
  panelClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  lockScroll = true,
  initialFocusRef,
  finalFocusRef,
  role = 'dialog',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [cachedChildren, setCachedChildren] =
    useState<React.ReactNode>(children);
  const [cachedTitle, setCachedTitle] = useState<React.ReactNode>(title);
  const [cachedDescription, setCachedDescription] =
    useState<React.ReactNode>(description);
  const panelRef = useRef<HTMLDivElement>(null);
  const pointerStartedInsideRef = useRef(false);
  const generatedTitleId = useId();
  const generatedDescriptionId = useId();
  const isClosing = closing || (mounted && !open);
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
      setMounted(true);
      setClosing(false);
      setCachedChildren(children);
      setCachedTitle(title);
      setCachedDescription(description);
    } else if (mounted) {
      setClosing(true);
    }
  }, [children, description, mounted, open, title]);

  useEffect(() => {
    if (open && children != null) {
      setCachedChildren(children);
      setCachedTitle(title);
      setCachedDescription(description);
    }
  }, [children, description, open, title]);

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || !closing) return;

      setMounted(false);
      setClosing(false);
      setCachedChildren(null);
      onExited?.();
    },
    [closing, onExited],
  );

  if (!mounted || typeof document === 'undefined') return null;

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

  return createPortal(
    <OverlayScopeContext.Provider value={scopeId}>
      <div
        data-modal-overlay={overlayId || modalId}
        data-lumen-motion
        className={`${overlayBaseClassName} ${
          isClosing
            ? 'animate-[lumen-page-fade-out_150ms_ease-in_forwards]'
            : 'animate-[lumen-page-fade-in_200ms_ease-out]'
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
        onAnimationEnd={handleAnimationEnd}
      >
        <div
          ref={panelRef}
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={resolvedAriaLabelledBy}
          aria-describedby={resolvedAriaDescribedBy}
          tabIndex={-1}
          data-modal={modalId}
          data-lumen-motion
          className={`max-h-[calc(100dvh-1.5rem)] ${
            isClosing
              ? 'animate-[lumen-modal-out_150ms_ease-in_forwards]'
              : 'animate-[lumen-modal-in_200ms_ease-out]'
          } ${panelClassName}`.trim()}
          onClick={(event) => event.stopPropagation()}
        >
          {hasTitle || hasDescription ? (
            <div data-modal-header>
              {hasTitle ? (
                <div
                  id={generatedTitleId}
                  data-modal-title
                  className="text-[16px] font-semibold leading-6 text-[var(--lumen-color-text)]"
                >
                  {displayTitle}
                </div>
              ) : null}
              {hasDescription ? (
                <div
                  id={generatedDescriptionId}
                  data-modal-description
                  className="mt-2 text-[14px] leading-6 text-[var(--lumen-color-text-secondary)]"
                >
                  {displayDescription}
                </div>
              ) : null}
            </div>
          ) : null}
          {displayChildren}
        </div>
      </div>
    </OverlayScopeContext.Provider>,
    document.body,
  );
};
