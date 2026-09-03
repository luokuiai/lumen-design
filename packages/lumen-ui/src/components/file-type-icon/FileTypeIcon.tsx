import { useId } from 'react';
import { cn } from '../classNames';
import { fileTypeCategoryLabels, resolveFileTypeIcon } from './fileTypeRegistry';
import type {
  FileTypeIconCategory,
  FileTypeIconProps,
  FileTypeIconSize,
} from './types';

const sizeValues: Record<FileTypeIconSize, number> = {
  sm: 24,
  md: 32,
  lg: 40,
};

const categoryColors: Record<FileTypeIconCategory, string> = {
  pdf: 'var(--lumen-color-file-pdf)',
  document: 'var(--lumen-color-file-document)',
  spreadsheet: 'var(--lumen-color-file-spreadsheet)',
  presentation: 'var(--lumen-color-file-presentation)',
  image: 'var(--lumen-color-file-image)',
  video: 'var(--lumen-color-file-video)',
  audio: 'var(--lumen-color-file-audio)',
  archive: 'var(--lumen-color-file-archive)',
  text: 'var(--lumen-color-file-text)',
  app: 'var(--lumen-color-file-app)',
  bin: 'var(--lumen-color-file-bin)',
};

const normalizeLabel = (label: string, category: FileTypeIconCategory) => {
  const normalized = label.trim().toUpperCase();
  return /^[A-Z0-9]{1,4}$/.test(normalized)
    ? normalized
    : fileTypeCategoryLabels[category];
};

export function FileTypeIcon({
  fileName,
  extension,
  mimeType,
  category: explicitCategory,
  label: explicitLabel,
  size = 'md',
  title,
  className,
  'aria-label': ariaLabel,
  ...props
}: FileTypeIconProps) {
  const titleId = useId();
  const resolved = resolveFileTypeIcon({ fileName, extension, mimeType });
  const category = explicitCategory ?? resolved.category;
  const label = normalizeLabel(
    explicitLabel ?? (explicitCategory ? fileTypeCategoryLabels[explicitCategory] : resolved.label),
    category,
  );
  const accessible = Boolean(title || ariaLabel);
  const pixelSize = sizeValues[size];

  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={pixelSize}
      height={pixelSize}
      fill="none"
      role={accessible ? 'img' : undefined}
      aria-hidden={accessible ? undefined : true}
      aria-label={ariaLabel}
      aria-labelledby={title && !ariaLabel ? titleId : undefined}
      data-file-type-category={category}
      data-file-type-label={label}
      className={cn('inline-block shrink-0', className)}
    >
      {title && !ariaLabel ? <title id={titleId}>{title}</title> : null}
      <path
        fill="var(--lumen-color-file-icon-border)"
        fillOpacity="0.18"
        stroke="var(--lumen-color-file-icon-border)"
        strokeWidth="1.5"
        d="M7.75 4A3.25 3.25 0 0 1 11 .75h16c.121 0 .238.048.323.134l10.793 10.793a.46.46 0 0 1 .134.323v24A3.25 3.25 0 0 1 35 39.25H11A3.25 3.25 0 0 1 7.75 36z"
      />
      <path
        stroke="var(--lumen-color-file-icon-border)"
        strokeWidth="1.5"
        d="M27 .5V8a4 4 0 0 0 4 4h7.5"
      />
      <rect width="26" height="16" x="1" y="18" fill={categoryColors[category]} rx="2" />
      <text
        x="14"
        y="29"
        fill="var(--lumen-color-file-icon-on-accent)"
        textAnchor="middle"
        fontSize={label.length > 3 ? '7.2' : '9.5'}
        fontWeight="700"
        letterSpacing="0"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}
