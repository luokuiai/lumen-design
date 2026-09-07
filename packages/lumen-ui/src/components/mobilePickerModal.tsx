import React from 'react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';
import { Modal } from './Modal';

interface MobilePickerModalProps {
  mobile: boolean;
  open: boolean;
  onRequestClose: () => void;
  label: string;
  modalId: string;
  maxWidth: string;
  children: React.ReactNode;
}

export const MobilePickerModal: React.FC<MobilePickerModalProps> = ({
  mobile,
  open,
  onRequestClose,
  label,
  modalId,
  maxWidth,
  children,
}) => {
  if (!mobile) return <>{children}</>;

  return (
    <Modal
      open={open}
      onRequestClose={onRequestClose}
      aria-label={label}
      modalId={modalId}
      overlayClassName="backdrop-blur-none"
      panelClassName={cn(
        'w-full overflow-hidden border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[0_18px_46px_var(--lumen-color-shadow)]',
        radiusTokens.modal,
        maxWidth,
      )}
    >
      {children}
    </Modal>
  );
};
