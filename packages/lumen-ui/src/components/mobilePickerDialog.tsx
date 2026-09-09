import React from 'react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';
import { Dialog } from './Dialog';

interface MobilePickerDialogProps {
  mobile: boolean;
  open: boolean;
  onRequestClose: () => void;
  label: string;
  dialogId: string;
  maxWidth: string;
  children: React.ReactNode;
}

export const MobilePickerDialog: React.FC<MobilePickerDialogProps> = ({
  mobile,
  open,
  onRequestClose,
  label,
  dialogId,
  maxWidth,
  children,
}) => {
  if (!mobile) return <>{children}</>;

  return (
    <Dialog
      open={open}
      onRequestClose={onRequestClose}
      aria-label={label}
      dialogId={dialogId}
      overlayClassName="backdrop-blur-none"
      panelClassName={cn(
        'w-full overflow-hidden border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[0_18px_46px_var(--lumen-color-shadow)]',
        radiusTokens.dialog,
        maxWidth,
      )}
    >
      {children}
    </Dialog>
  );
};
