import React from 'react';
import { X } from 'lucide-react';
import { Badge, type BadgeVariant } from '../Badge';
import { FileTypeIcon } from '../file-type-icon/FileTypeIcon';
import { cn } from '../classNames';
import { radiusTokens } from '../designTokens';
import { useLumenLocale } from '../../i18n';
import { OverflowText } from './overflowText';
import { formatBytes } from './formatBytes';

export type FileListDensity = 'default' | 'compact';

export interface FileListBadge {
  label: string;
  variant?: BadgeVariant;
}

/** File metadata; remote attachments do not need browser File objects. */
export interface FileListFile {
  id: string;
  name: string;
  size?: number;
  type?: string;
  badge?: FileListBadge;
}

export interface FileListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  file: FileListFile;
  /** Show known file sizes. Defaults to true. */
  showSize?: boolean;
  /** Wrap the full name instead of truncating. Defaults to false. */
  wrapName?: boolean;
  density?: FileListDensity;
  disabled?: boolean;
  /** Custom buttons displayed at the trailing edge, before removal. */
  actions?: React.ReactNode;
  /** Omit to hide the remove button. */
  onRemove?: (file: FileListFile) => void;
}

export function FileListItem({
  file, showSize = true, wrapName = false, density = 'default',
  disabled = false, onRemove, actions, className, ...props
}: FileListItemProps) {
  const locale = useLumenLocale();
  return (
    <li
      {...props}
      className={cn(
        'flex min-w-0 items-center gap-3 border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] px-3',
        density === 'compact' ? 'min-h-10 rounded-[7px] py-1.5' : `${radiusTokens.icon} min-h-12 py-2`,
        className,
      )}
    >
      <FileTypeIcon fileName={file.name} mimeType={file.type} size="md" />
      <span className="min-w-0 flex-1 text-left">
        <OverflowText text={file.name} wrap={wrapName} className="text-[14px] font-normal text-[var(--lumen-color-text)]" />
        {showSize && file.size !== undefined && Number.isFinite(file.size) && file.size >= 0 ? (
          <span className="mt-0.5 block text-[13px] text-[var(--lumen-color-text-placeholder)]">
            {formatBytes(file.size)}
          </span>
        ) : null}
      </span>
      {file.badge ? (
        <Badge variant={file.badge.variant} size="sm" className="min-w-0 max-w-[35%] shrink-0">
          <OverflowText text={file.badge.label} />
        </Badge>
      ) : null}
      {actions != null || onRemove ? (
        <div className="flex shrink-0 items-center justify-end gap-1">
          {actions}
          {onRemove ? (
            <button
              type="button"
              disabled={disabled}
              aria-label={locale.fileUpload.removeFile(file.name)}
              onClick={() => onRemove(file)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--lumen-color-text-placeholder)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-danger)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <X size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export interface FileListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Render trailing actions; callers control their disabled state. */
  renderActions?: (file: FileListFile) => React.ReactNode;
  items: FileListFile[];
  showSize?: boolean;
  wrapName?: boolean;
  density?: FileListDensity;
  disabled?: boolean;
  onRemove?: (file: FileListFile) => void;
}

export function FileList({
  items, showSize, wrapName, density = 'default', disabled, onRemove, renderActions, className, ...props
}: FileListProps) {
  return (
    <ul {...props} className={cn('m-0 min-w-0 list-none p-0', density === 'compact' ? 'space-y-1.5' : 'space-y-2', className)}>
      {items.map((file) => (
        <FileListItem key={file.id} file={file} showSize={showSize} wrapName={wrapName} density={density} disabled={disabled} onRemove={onRemove} actions={renderActions?.(file)} />
      ))}
    </ul>
  );
}
