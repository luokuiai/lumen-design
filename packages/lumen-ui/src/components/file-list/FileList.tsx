import React from 'react';
import { EllipsisVertical, X } from 'lucide-react';
import { Badge, type BadgeVariant } from '../Badge';
import { DropdownMenu, DropdownMenuItem } from '../DropdownMenu';
import { FileTypeIcon } from '../file-type-icon/FileTypeIcon';
import { cn } from '../classNames';
import { radiusTokens } from '../designTokens';
import { useLumenLocale } from '../../i18n';
import { Progress } from '../Progress';
import { OverflowText } from './overflowText';
import { formatBytes } from './formatBytes';

export interface FileListBadge {
  label: string;
  variant?: BadgeVariant;
}

export type FileListDensity = 'default' | 'compact';

/** File metadata; remote attachments do not need browser File objects. */
export interface FileListFile {
  id: string;
  name: string;
  size?: number;
  type?: string;
  /** Upload percentage displayed below the file name. Values are clamped to 0-100. */
  progress?: number;
  badge?: FileListBadge;
}

export interface FileListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  file: FileListFile;
  /** Show known file sizes. Defaults to true. */
  showSize?: boolean;
  /** Move metadata into a tighter horizontal layout. Defaults to default. */
  density?: FileListDensity;
  /** Wrap the full name instead of truncating. Defaults to false. */
  wrapName?: boolean;
  /** Badge maximum width (numbers are pixels). Defaults to 96; capped at 35% of the row. */
  badgeMaxWidth?: number | string;
  disabled?: boolean;
  /** Custom buttons displayed at the trailing edge, before removal. */
  actions?: React.ReactNode;
  /** Omit to hide the remove button. */
  onRemove?: (file: FileListFile) => void;
}

interface FileActionElementProps {
  'aria-label'?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  title?: string;
}

const renderActionMenuItems = (
  actions: React.ReactNode,
  close: () => void,
  parentDisabled: boolean,
): React.ReactNode => React.Children.map(actions, (action) => {
  if (!React.isValidElement(action)) return null;

  const actionProps = action.props as FileActionElementProps;
  if (action.type === React.Fragment) {
    return renderActionMenuItems(actionProps.children, close, parentDisabled);
  }

  const label = actionProps.title ?? actionProps.children ?? actionProps['aria-label'];
  if (label == null || !actionProps.onClick) return null;

  return (
    <DropdownMenuItem
      key={action.key}
      disabled={parentDisabled || actionProps.disabled}
      onClick={(event) => {
        actionProps.onClick?.(event);
        if (!event.defaultPrevented) close();
      }}
    >
      {actionProps.icon}
      {label}
    </DropdownMenuItem>
  );
});

export function FileListItem({
  file, showSize = true, density = 'default', wrapName = false, badgeMaxWidth = 96,
  disabled = false, onRemove, actions, className, style, ...props
}: FileListItemProps) {
  const locale = useLumenLocale();
  const compact = density === 'compact';
  const formattedSize =
    showSize && file.size !== undefined && Number.isFinite(file.size) && file.size >= 0
      ? formatBytes(file.size)
      : undefined;
  const normalizedProgress = file.progress === undefined || !Number.isFinite(file.progress)
    ? undefined
    : Math.min(100, Math.max(0, file.progress));
  const renderRemoveButton = () => onRemove ? (
    <button
      type="button"
      disabled={disabled}
      aria-label={locale.fileUpload.removeFile(file.name)}
      onClick={() => onRemove(file)}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--lumen-color-text-placeholder)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-danger)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <X size={14} aria-hidden="true" />
    </button>
  ) : null;

  return (
    <li
      {...props}
      style={{
        ...style,
        '--lumen-file-badge-max-width': typeof badgeMaxWidth === 'number' ? `${badgeMaxWidth}px` : badgeMaxWidth,
      } as React.CSSProperties}
      className={cn(
        'flex min-w-0 items-center gap-3 border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] px-3',
        `${radiusTokens.icon} min-h-12 py-2`,
        className,
      )}
    >
      <FileTypeIcon fileName={file.name} mimeType={file.type} size="md" />
      <span className="min-w-0 flex-1 text-left">
        <OverflowText text={file.name} wrap={wrapName} className="text-[14px] font-normal text-[var(--lumen-color-text)]" />
        {!compact && formattedSize !== undefined ? (
          <span className="mt-0.5 block text-[13px] text-[var(--lumen-color-text-placeholder)]">
            {formattedSize}
          </span>
        ) : null}
        {normalizedProgress !== undefined ? (
          <Progress
            className="mt-1"
            value={normalizedProgress}
            aria-label={`${file.name} ${locale.fileUpload.progress}`}
          />
        ) : null}
      </span>
      {compact && formattedSize !== undefined ? (
        <span className="shrink-0 whitespace-nowrap text-[13px] tabular-nums text-[var(--lumen-color-text-placeholder)]">
          {formattedSize}
        </span>
      ) : null}
      {file.badge ? (
        <Badge variant={file.badge.variant} size="md" className="min-w-0 max-w-[min(var(--lumen-file-badge-max-width),35%)] shrink-0">
          <OverflowText text={file.badge.label} />
        </Badge>
      ) : null}
      {actions != null || onRemove ? (
        <>
          <div className={cn('shrink-0 items-center justify-end gap-1', actions != null ? 'flex mobile:hidden' : 'flex')}>
            {actions}
            {renderRemoveButton()}
          </div>
          {actions != null ? (
            <DropdownMenu
              align="right"
              menuMode
              className="hidden shrink-0 mobile:block"
              trigger={({ open, menuId, toggle }) => (
                <button
                  type="button"
                  aria-label={locale.fileUpload.fileActions(file.name)}
                  aria-controls={open ? menuId : undefined}
                  aria-expanded={open}
                  disabled={disabled}
                  onClick={toggle}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--lumen-color-text-placeholder)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <EllipsisVertical size={16} aria-hidden="true" />
                </button>
              )}
            >
              {({ close }) => (
                <>
                  {renderActionMenuItems(actions, close, disabled)}
                  {onRemove ? (
                    <DropdownMenuItem
                      disabled={disabled}
                      className="text-[var(--lumen-color-danger)] hover:text-[var(--lumen-color-danger)] focus-visible:text-[var(--lumen-color-danger)]"
                      onClick={() => {
                        onRemove(file);
                        close();
                      }}
                    >
                      <X size={14} aria-hidden="true" />
                      {locale.fileUpload.removeAction}
                    </DropdownMenuItem>
                  ) : null}
                </>
              )}
            </DropdownMenu>
          ) : null}
        </>
      ) : null}
    </li>
  );
}

export interface FileListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Badge maximum width (numbers are pixels). Defaults to 96; capped at 35% of the row. */
  badgeMaxWidth?: number | string;
  /** Render trailing actions; callers control their disabled state. */
  renderActions?: (file: FileListFile) => React.ReactNode;
  items: FileListFile[];
  showSize?: boolean;
  density?: FileListDensity;
  wrapName?: boolean;
  disabled?: boolean;
  onRemove?: (file: FileListFile) => void;
}

export function FileList({
  items, showSize, density, wrapName, badgeMaxWidth, disabled, onRemove, renderActions, className, ...props
}: FileListProps) {
  return (
    <ul {...props} className={cn('m-0 min-w-0 list-none space-y-2 p-0', className)}>
      {items.map((file) => (
        <FileListItem key={file.id} file={file} showSize={showSize} density={density} wrapName={wrapName} badgeMaxWidth={badgeMaxWidth} disabled={disabled} onRemove={onRemove} actions={renderActions?.(file)} />
      ))}
    </ul>
  );
}
