import React, { useRef, useState } from 'react';
import { FileText, LoaderCircle, UploadCloud, X } from 'lucide-react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';
import { useLumenLocale } from '../i18n';

export type FileUploadDensity = 'default' | 'compact';
export type FileRejectionReason = 'type' | 'size' | 'limit' | 'custom';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
  message: string;
}

export interface FileUploadProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  validateFile?: (file: File) => string | null;
  onReject?: (rejections: FileRejection[]) => void;
  disabled?: boolean;
  density?: FileUploadDensity;
  hint?: React.ReactNode;
  showFileList?: boolean;
  uploading?: boolean;
  progress?: number;
  inputAriaLabel?: string;
}

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const getFileKey = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}`;

const acceptsFile = (file: File, accept?: string) => {
  if (!accept) return true;
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  return accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return fileName.endsWith(rule);
      if (rule.endsWith('/*')) return fileType.startsWith(rule.slice(0, -1));
      return fileType === rule;
    });
};

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      value,
      onChange,
      accept,
      multiple = false,
      maxFiles,
      maxSize,
      validateFile,
      onReject,
      disabled = false,
      density = 'default',
      hint,
      showFileList = true,
      uploading = false,
      progress,
      inputAriaLabel,
      className,
      ...props
    },
    ref,
  ) => {
    const locale = useLumenLocale();
    const resolvedInputAriaLabel = inputAriaLabel ?? locale.fileUpload.inputLabel;
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const compact = density === 'compact';
    const effectiveMaxFiles = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1;

    const addFiles = (incoming: File[]) => {
      if (disabled || uploading || incoming.length === 0) return;

      const existingKeys = new Set(value.map(getFileKey));
      const accepted: File[] = [];
      const rejections: FileRejection[] = [];

      for (const file of incoming) {
        if (!acceptsFile(file, accept)) {
          rejections.push({ file, reason: 'type', message: locale.fileUpload.unsupportedType });
          continue;
        }
        if (maxSize !== undefined && file.size > maxSize) {
          rejections.push({
            file,
            reason: 'size',
            message: locale.fileUpload.maxSize(formatBytes(maxSize)),
          });
          continue;
        }
        const customMessage = validateFile?.(file);
        if (customMessage) {
          rejections.push({ file, reason: 'custom', message: customMessage });
          continue;
        }
        const key = getFileKey(file);
        if (existingKeys.has(key)) continue;
        if ((multiple ? value.length : 0) + accepted.length >= effectiveMaxFiles) {
          rejections.push({
            file,
            reason: 'limit',
            message: locale.fileUpload.maxFiles(effectiveMaxFiles),
          });
          continue;
        }
        existingKeys.add(key);
        accepted.push(file);
      }

      if (accepted.length > 0) {
        onChange(multiple ? [...value, ...accepted] : accepted.slice(0, 1));
      }
      if (rejections.length > 0) onReject?.(rejections);
    };

    const removeFile = (file: File) => {
      const key = getFileKey(file);
      onChange(value.filter((item) => getFileKey(item) !== key));
    };

    const normalizedProgress =
      progress === undefined ? undefined : Math.min(100, Math.max(0, progress));

    return (
      <div
        ref={ref}
        className={cn('flex w-full min-w-0 flex-col', compact ? 'gap-2' : 'gap-4', className)}
        {...props}
      >
        <button
          type="button"
          disabled={disabled || uploading}
          aria-label={resolvedInputAriaLabel}
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled && !uploading) setIsDragOver(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsDragOver(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragOver(false);
            addFiles(Array.from(event.dataTransfer.files));
          }}
          className={cn(
            'relative w-full min-w-0 border-dashed text-[var(--lumen-color-text-muted)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60',
            compact
              ? 'min-h-11 rounded-[7px] border px-3'
              : 'rounded-[var(--lumen-radius-card)] border-2 px-5 py-3',
            isDragOver
              ? 'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]'
              : 'border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)] hover:border-[var(--lumen-color-info-border)] hover:bg-[var(--lumen-color-surface-hover)] hover:text-[var(--lumen-color-primary)]',
          )}
        >
          {compact ? (
            <span className="flex min-h-11 items-center justify-center gap-2 text-[12px]">
              {uploading ? (
                <LoaderCircle size={16} className="shrink-0 animate-spin" />
              ) : (
                <UploadCloud size={16} className="shrink-0" />
              )}
              <span className="min-w-0 text-left">
                <span className="block truncate">
                  {uploading
                    ? locale.fileUpload.uploading
                    : isDragOver
                      ? locale.fileUpload.dropToUpload
                      : locale.fileUpload.dragOrClick}
                </span>
                {hint ? (
                  <span className="mt-0.5 block text-[12px] font-normal text-[var(--lumen-color-text-placeholder)]">
                    {hint}
                  </span>
                ) : null}
              </span>
            </span>
          ) : (
            <span className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text-placeholder)] transition-all duration-200',
                  isDragOver && 'scale-110 bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]',
                )}
              >
                {uploading ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <UploadCloud size={18} />
                )}
              </span>
              <span className="mt-2 text-[13px] font-medium text-[var(--lumen-color-text-secondary)]">
                {uploading
                  ? locale.fileUpload.uploading
                  : isDragOver
                    ? locale.fileUpload.dropToUpload
                    : locale.fileUpload.dragOrChoose}
              </span>
              {hint ? (
                <span className="mt-1 text-[12px] text-[var(--lumen-color-text-placeholder)]">
                  {hint}
                </span>
              ) : null}
            </span>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          disabled={disabled || uploading}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.target.value = '';
          }}
        />

        {uploading && normalizedProgress !== undefined ? (
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--lumen-color-border)]"
            role="progressbar"
            aria-label={locale.fileUpload.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(normalizedProgress)}
          >
            <div
              className="h-full rounded-full bg-[var(--lumen-color-primary)] transition-[width] duration-200"
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>
        ) : null}

        {showFileList && value.length > 0 ? (
          <div className={cn('border-t border-[var(--lumen-color-border)] pt-2', compact ? 'space-y-1.5' : 'space-y-2')}>
            {value.map((file) => (
              <div
                key={getFileKey(file)}
                className={cn(
                  'flex min-w-0 items-center gap-3 border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] px-3',
                  compact ? 'min-h-10 rounded-[7px] py-1.5' : `${radiusTokens.icon} min-h-12 py-2`,
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]">
                  <FileText size={16} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[13px] font-medium text-[var(--lumen-color-text)]">
                    {file.name}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-[var(--lumen-color-text-placeholder)]">
                    {formatBytes(file.size)}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={disabled || uploading}
                  aria-label={locale.fileUpload.removeFile(file.name)}
                  onClick={() => removeFile(file)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--lumen-color-text-placeholder)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-danger)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);

FileUpload.displayName = 'FileUpload';
