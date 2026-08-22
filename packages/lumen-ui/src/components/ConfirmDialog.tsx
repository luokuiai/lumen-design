import React from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { ButtonVariant } from './designTokens';

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
  confirmText = '确认',
  confirmVariant = 'primary',
  cancelText = '取消',
  confirmDisabled = false,
  confirmLoading = false,
  cancelDisabled = false,
  closeOnOverlayClick = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={open}
      onRequestClose={onCancel}
      modalId="confirm-dialog"
      overlayId="confirm-dialog-overlay"
      closeOnOverlayClick={closeOnOverlayClick}
      panelClassName="w-full max-w-[420px] rounded-[12px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] p-4 shadow-[0_24px_70px_var(--lumen-color-shadow)] pad:p-5 l:p-6"
    >
      <div role="dialog" aria-label={title}>
        <div className="text-[18px] font-semibold text-[var(--lumen-color-text)]">{title}</div>
        <div className="mt-3 text-[14px] leading-6 text-[var(--lumen-color-text-secondary)]">
          {message}
        </div>
        <div
          data-confirm-dialog-actions
          className="mt-5 flex flex-col-reverse gap-2.5 pad:mt-6 pad:flex-row pad:items-center pad:justify-end l:mt-6 l:flex-row l:items-center l:justify-end"
        >
          <Button
            disabled={cancelDisabled}
            variant="outline"
            type="button"
            onClick={onCancel}
          >
            {cancelText}
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
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
