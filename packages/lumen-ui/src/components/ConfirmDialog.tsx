import React from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal';
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
    <Modal
      open={open}
      onRequestClose={onCancel}
      modalId="confirm-dialog"
      overlayId="confirm-dialog-overlay"
      closeOnOverlayClick={closeOnOverlayClick}
      role="alertdialog"
      title={title}
      description={message}
      panelClassName="w-full max-w-[420px] rounded-[12px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] p-4 shadow-[0_24px_70px_var(--lumen-color-shadow)] pad:p-5 l:p-6"
    >
      <div
        data-confirm-dialog-actions
        className="mt-5 flex items-center justify-end gap-2.5 pad:mt-6 l:mt-6"
      >
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
      </div>
    </Modal>
  );
};
