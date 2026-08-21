import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onRequestClose: () => void;
  onExited?: () => void;
  children: React.ReactNode;
  modalId?: string;
  overlayId?: string;
  overlayClassName?: string;
  panelClassName?: string;
  closeOnOverlayClick?: boolean;
}

const overlayBaseClassName =
  'fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-[var(--lumen-color-overlay)] p-3 backdrop-blur-sm mobile:items-end pad:p-4 l:p-5 xl:p-6';

export const Modal: React.FC<ModalProps> = ({
  open,
  onRequestClose,
  onExited,
  children,
  modalId,
  overlayId,
  overlayClassName = '',
  panelClassName = '',
  closeOnOverlayClick = true,
}) => {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [cachedChildren, setCachedChildren] = useState<React.ReactNode>(children);
  const isClosing = closing || (mounted && !open);

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

  const displayChildren = isClosing ? cachedChildren : children;

  return createPortal(
    <div
      data-modal-overlay={overlayId || modalId}
      data-lumen-motion
      className={`${overlayBaseClassName} ${isClosing ? 'animate-[lumen-page-fade-out_150ms_ease-in_forwards]' : 'animate-[lumen-page-fade-in_200ms_ease-out]'} ${overlayClassName}`.trim()}
      onClick={closeOnOverlayClick ? onRequestClose : undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        data-modal={modalId}
        data-lumen-motion
        className={`max-h-[calc(100dvh-1.5rem)] max-w-full ${isClosing ? 'animate-[lumen-modal-out_150ms_ease-in_forwards]' : 'animate-[lumen-modal-in_200ms_ease-out]'} ${panelClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
      >
        {displayChildren}
      </div>
    </div>,
    document.body,
  );
};
