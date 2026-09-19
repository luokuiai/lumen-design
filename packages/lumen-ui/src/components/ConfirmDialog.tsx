import React from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import type { ButtonVariant } from './designTokens';
import { useLumenLocale } from '../i18n';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: ButtonVariant;
  cancelText?: string;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  cancelDisabled?: boolean;
  closeOnOverlayClick?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  confirmVariant = 'primary',
  cancelText,
  confirmDisabled = false,
  confirmLoading = false,
  cancelDisabled = false,
  closeOnOverlayClick = true,
  onConfirm,
  onCancel,
}) => {
  const locale = useLumenLocale();
  return (
    <Dialog
      open={open}
      onRequestClose={onCancel}
      dialogId="confirm-dialog"
      overlayId="confirm-dialog-overlay"
      closeOnOverlayClick={closeOnOverlayClick}
      role="alertdialog"
      title={title}
      description={message}
      panelClassName="max-w-[420px]"
      footer={
        <>
          <Button
            disabled={cancelDisabled}
            variant="outline"
            type="button"
            onClick={onCancel}
          >
            {cancelText ?? locale.confirmDialog.cancel}
          </Button>
          <Button
            aria-busy={confirmLoading}
            disabled={confirmDisabled || confirmLoading}
            type="button"
            variant={confirmVariant}
            onClick={onConfirm}
          >
            {confirmLoading && (
              <Loader2 aria-hidden="true" className="animate-spin" size={14} />
            )}
            {confirmText ?? locale.confirmDialog.confirm}
          </Button>
        </>
      }
    />
  );
};
