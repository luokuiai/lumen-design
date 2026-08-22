import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type DrawerPlacement = 'left' | 'right';

export interface DrawerProps {
  open: boolean;
  onRequestClose: () => void;
  onExited?: () => void;
  children: React.ReactNode;
  drawerId?: string;
  overlayId?: string;
  overlayClassName?: string;
  panelClassName?: string;
  placement?: DrawerPlacement;
  closeOnOverlayClick?: boolean;
  overlayDataAttributes?: Record<string, string | boolean>;
  panelDataAttributes?: Record<string, string | boolean>;
}

const overlayBaseClassName =
  'fixed inset-0 z-[100] flex items-stretch overflow-hidden bg-[var(--lumen-color-overlay)] backdrop-blur-[2px]';

const buildDataAttributes = (attributes?: Record<string, string | boolean>) =>
  Object.fromEntries(
    Object.entries(attributes ?? {}).map(([key, value]) => [`data-${key}`, value]),
  );

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onRequestClose,
  onExited,
  children,
  drawerId,
  overlayId,
  overlayClassName = '',
  panelClassName = '',
  placement = 'right',
  closeOnOverlayClick = true,
  overlayDataAttributes,
  panelDataAttributes,
}) => {
  const [mounted, setMounted] = useState(open);
  const [cachedChildren, setCachedChildren] = useState<React.ReactNode>(children);
  const exitCompletedRef = useRef(false);

  useEffect(() => {
    if (open) {
      exitCompletedRef.current = false;
      setMounted(true);
      setCachedChildren(children);
    }
  }, [children, open]);

  const finishExit = useCallback(() => {
    if (exitCompletedRef.current) return;
    exitCompletedRef.current = true;
    setMounted(false);
    setCachedChildren(null);
    onExited?.();
  }, [onExited]);

  useEffect(() => {
    if (!mounted || open) return undefined;

    const timer = window.setTimeout(finishExit, 220);
    return () => window.clearTimeout(timer);
  }, [finishExit, mounted, open]);

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLElement>) => {
      if (event.target !== event.currentTarget || open) return;
      finishExit();
    },
    [finishExit, open],
  );

  if (!mounted || typeof document === 'undefined') return null;

  const isClosing = mounted && !open;
  const displayChildren = isClosing ? cachedChildren : children;
  const drawerState = isClosing ? 'closing' : 'open';

  return createPortal(
    <div
      data-drawer-overlay={overlayId || drawerId}
      data-drawer-state={drawerState}
      data-lumen-motion
      className={`${overlayBaseClassName} lumen-drawer-overlay ${placement === 'left' ? 'justify-start' : 'justify-end'} ${overlayClassName}`.trim()}
      onClick={closeOnOverlayClick ? onRequestClose : undefined}
      {...buildDataAttributes(overlayDataAttributes)}
    >
      <aside
        data-drawer={drawerId}
        data-drawer-placement={placement}
        data-drawer-state={drawerState}
        data-lumen-motion
        className={`lumen-drawer-panel h-full max-w-full overflow-y-auto ${panelClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
        {...buildDataAttributes(panelDataAttributes)}
      >
        {displayChildren}
      </aside>
    </div>,
    document.body,
  );
};
