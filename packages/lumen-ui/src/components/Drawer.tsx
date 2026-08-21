import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  open: boolean;
  onRequestClose: () => void;
  onExited?: () => void;
  children: React.ReactNode;
  drawerId?: string;
  overlayId?: string;
  overlayClassName?: string;
  panelClassName?: string;
  closeOnOverlayClick?: boolean;
  overlayDataAttributes?: Record<string, string | boolean>;
  panelDataAttributes?: Record<string, string | boolean>;
}

const overlayBaseClassName =
  'fixed inset-0 z-[100] flex items-stretch justify-end overflow-hidden bg-[var(--lumen-color-overlay)] backdrop-blur-[2px]';

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
  closeOnOverlayClick = true,
  overlayDataAttributes,
  panelDataAttributes,
}) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [cachedChildren, setCachedChildren] = useState<React.ReactNode>(children);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      setCachedChildren(children);
    } else if (mounted) {
      setClosing(true);
    }
  }, [children, mounted, open]);

  useEffect(() => {
    if (open && children != null) {
      setCachedChildren(children);
    }
  }, [children, open]);

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

  const displayChildren = closing ? cachedChildren : children;

  return createPortal(
    <div
      data-drawer-overlay={overlayId || drawerId}
      data-lumen-motion
      className={`${overlayBaseClassName} ${closing ? 'animate-[lumen-page-fade-out_150ms_ease-in_forwards]' : 'animate-[lumen-page-fade-in_200ms_ease-out]'} ${overlayClassName}`.trim()}
      onClick={closeOnOverlayClick ? onRequestClose : undefined}
      onAnimationEnd={handleAnimationEnd}
      {...buildDataAttributes(overlayDataAttributes)}
    >
      <aside
        data-drawer={drawerId}
        data-lumen-motion
        className={`h-full max-w-full overflow-y-auto ${closing ? 'animate-[lumen-drawer-out_250ms_ease-in_forwards]' : 'animate-[lumen-drawer-in_300ms_ease-out]'} ${panelClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
        {...buildDataAttributes(panelDataAttributes)}
      >
        {displayChildren}
      </aside>
    </div>,
    document.body,
  );
};
