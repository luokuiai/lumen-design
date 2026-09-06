import React, { useCallback, useEffect, useRef, useState } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const overlayStack: symbol[] = [];
let nextOverlayZIndex = 100;
let scrollLockCount = 0;
let previousScrollStyles: {
  bodyOverflow: string;
  bodyPaddingRight: string;
  bodyOverscrollBehavior: string;
  rootOverflow: string;
} | null = null;

const isElementVisible = (element: HTMLElement) =>
  element.getAttribute('aria-hidden') !== 'true' &&
  !element.hidden &&
  window.getComputedStyle(element).display !== 'none' &&
  window.getComputedStyle(element).visibility !== 'hidden';

const getFocusableElements = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isElementVisible);

export const OverlayScopeContext = React.createContext<string | null>(null);

export const useOverlayPortalScope = () =>
  React.useContext(OverlayScopeContext);

const lockDocumentScroll = () => {
  scrollLockCount += 1;
  if (scrollLockCount !== 1) return;

  const { body, documentElement } = document;
  previousScrollStyles = {
    bodyOverflow: body.style.overflow,
    bodyPaddingRight: body.style.paddingRight,
    bodyOverscrollBehavior: body.style.overscrollBehavior,
    rootOverflow: documentElement.style.overflow,
  };

  const viewportWidth = documentElement.clientWidth;
  const scrollbarWidth =
    viewportWidth > 0 ? window.innerWidth - viewportWidth : 0;
  if (scrollbarWidth > 0) {
    const currentPadding =
      Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
  body.style.overflow = 'hidden';
  body.style.overscrollBehavior = 'contain';
  documentElement.style.overflow = 'hidden';
};

const unlockDocumentScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount !== 0 || !previousScrollStyles) return;

  const { body, documentElement } = document;
  body.style.overflow = previousScrollStyles.bodyOverflow;
  body.style.paddingRight = previousScrollStyles.bodyPaddingRight;
  body.style.overscrollBehavior = previousScrollStyles.bodyOverscrollBehavior;
  documentElement.style.overflow = previousScrollStyles.rootOverflow;
  previousScrollStyles = null;
};

const removeFromOverlayStack = (token: symbol) => {
  const index = overlayStack.lastIndexOf(token);
  if (index >= 0) overlayStack.splice(index, 1);
  if (overlayStack.length === 0) nextOverlayZIndex = 100;
};

export interface UseOverlayBehaviorOptions {
  enabled: boolean;
  dismissable: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  finalFocusRef?: React.RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  onRequestClose: () => void;
}

export const useOverlayBehavior = ({
  enabled,
  dismissable,
  containerRef,
  initialFocusRef,
  finalFocusRef,
  closeOnEscape = true,
  lockScroll = true,
  onRequestClose,
}: UseOverlayBehaviorOptions) => {
  const scopeId = React.useId();
  const tokenRef = useRef(Symbol('lumen-overlay'));
  const requestCloseRef = useRef(onRequestClose);
  const dismissableRef = useRef(dismissable);
  const closeOnEscapeRef = useRef(closeOnEscape);
  const lastFocusedInsideRef = useRef<HTMLElement | null>(null);
  const [zIndex, setZIndex] = useState(100);
  const [viewportStyle, setViewportStyle] = useState<React.CSSProperties>({
    bottom: 'auto',
    height: '100dvh',
  });

  requestCloseRef.current = onRequestClose;
  dismissableRef.current = dismissable;
  closeOnEscapeRef.current = closeOnEscape;

  const isTopmost = useCallback(
    () => overlayStack.at(-1) === tokenRef.current,
    [],
  );

  const requestCloseIfTopmost = useCallback(() => {
    if (isTopmost() && dismissableRef.current) requestCloseRef.current();
  }, [isTopmost]);

  useEffect(() => {
    if (!enabled) return undefined;

    const token = tokenRef.current;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const explicitlyFinalFocus = finalFocusRef?.current;
    overlayStack.push(token);
    nextOverlayZIndex += 1;
    setZIndex(nextOverlayZIndex);
    if (lockScroll) lockDocumentScroll();

    const focusInitialElement = () => {
      if (!isTopmost()) return;
      const container = containerRef.current;
      if (!container) return;
      const target =
        initialFocusRef?.current ??
        container.querySelector<HTMLElement>('[autofocus]') ??
        getFocusableElements(container)[0] ??
        container;
      target.focus({ preventScroll: true });
      lastFocusedInsideRef.current = target;
    };

    const animationFrame = window.requestAnimationFrame(focusInitialElement);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isTopmost()) return;

      const target = event.target;
      const isOwnedPortalTarget =
        target instanceof HTMLElement &&
        target
          .closest('[data-lumen-overlay-scope]')
          ?.getAttribute('data-lumen-overlay-scope') === scopeId;

      if (event.defaultPrevented) return;

      if (
        event.key === 'Escape' &&
        closeOnEscapeRef.current &&
        dismissableRef.current
      ) {
        event.preventDefault();
        event.stopPropagation();
        requestCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;
      if (isOwnedPortalTarget && !container.contains(target)) return;
      const focusable = getFocusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1);
      const activeElement = document.activeElement;
      if (
        event.shiftKey &&
        (activeElement === first || !container.contains(activeElement))
      ) {
        event.preventDefault();
        last?.focus({ preventScroll: true });
      } else if (
        !event.shiftKey &&
        (activeElement === last || !container.contains(activeElement))
      ) {
        event.preventDefault();
        first?.focus({ preventScroll: true });
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isTopmost()) return;
      const container = containerRef.current;
      const target = event.target;
      if (!container || !(target instanceof HTMLElement)) return;
      const isOwnedPortalTarget =
        target
          .closest('[data-lumen-overlay-scope]')
          ?.getAttribute('data-lumen-overlay-scope') === scopeId;
      if (container.contains(target) || isOwnedPortalTarget) {
        lastFocusedInsideRef.current = target;
        return;
      }

      const fallback =
        lastFocusedInsideRef.current ??
        getFocusableElements(container)[0] ??
        container;
      fallback.focus({ preventScroll: true });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      removeFromOverlayStack(token);
      if (lockScroll) unlockDocumentScroll();

      const focusTarget = explicitlyFinalFocus ?? previouslyFocused;
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
      lastFocusedInsideRef.current = null;
    };
  }, [
    containerRef,
    enabled,
    finalFocusRef,
    initialFocusRef,
    isTopmost,
    lockScroll,
    scopeId,
  ]);

  useEffect(() => {
    if (!enabled || !window.visualViewport) {
      setViewportStyle({ bottom: 'auto', height: '100dvh' });
      return undefined;
    }

    const viewport = window.visualViewport;
    const updateViewport = () => {
      setViewportStyle({
        bottom: 'auto',
        height: `${viewport.height}px`,
        top: `${viewport.offsetTop}px`,
      });
    };
    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);
    return () => {
      viewport.removeEventListener('resize', updateViewport);
      viewport.removeEventListener('scroll', updateViewport);
    };
  }, [enabled]);

  return { isTopmost, requestCloseIfTopmost, scopeId, viewportStyle, zIndex };
};
