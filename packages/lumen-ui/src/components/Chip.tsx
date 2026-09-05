import React from 'react';
import { X } from 'lucide-react';
import { cn } from './classNames';
import { semanticBadgeToneClassNames } from './designTokens';
import { useLumenLocale } from '../i18n';

export type ChipTone = keyof typeof semanticBadgeToneClassNames;
export type ChipSize = 'sm' | 'md';
export type ChipShape = 'rounded' | 'pill';

interface ChipBaseProps {
  children: React.ReactNode;
  tone?: ChipTone;
  size?: ChipSize;
  shape?: ChipShape;
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  closeLabel?: string;
  className?: string;
}

export type ChipProps = ChipBaseProps & (
  | {
      onSelect: (selected: boolean) => void;
      onClose?: () => void;
    }
  | {
      onSelect?: (selected: boolean) => void;
      onClose: () => void;
    }
);

const chipSizeClassNames: Record<ChipSize, string> = {
  sm: 'min-h-5 text-[12px]',
  md: 'min-h-[26px] text-[13px]',
};

const chipShapeClassNames: Record<ChipShape, string> = {
  rounded: 'rounded-[4px]',
  pill: 'rounded-full',
};

export const Chip: React.FC<ChipProps> = ({
  children,
  tone = 'neutral',
  size = 'md',
  shape = 'rounded',
  icon,
  selected = false,
  disabled = false,
  onSelect,
  onClose,
  closeLabel,
  className,
}) => {
  const locale = useLumenLocale();
  const content = (
    <>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="min-w-0 truncate">{children}</span>
    </>
  );

  return (
    <span
      data-ui="chip"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        'inline-flex max-w-full items-center overflow-hidden font-normal leading-none ring-inset transition-colors',
        semanticBadgeToneClassNames[tone],
        chipSizeClassNames[size],
        chipShapeClassNames[shape],
        selected && 'ring-1 ring-current',
        disabled && 'opacity-50',
        className,
      )}
    >
      {onSelect ? (
        <button
          type="button"
          aria-pressed={selected}
          disabled={disabled}
          className="inline-flex min-w-0 items-center gap-1.5 self-stretch px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current/30 disabled:cursor-not-allowed"
          onClick={() => onSelect(!selected)}
        >
          {content}
        </button>
      ) : (
        <span className="inline-flex min-w-0 items-center gap-1.5 px-2">{content}</span>
      )}
      {onClose ? (
        <button
          type="button"
          aria-label={closeLabel ?? locale.accessibility.chipRemove}
          disabled={disabled}
          className="mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] opacity-65 transition-colors hover:bg-current/10 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current/30 disabled:cursor-not-allowed"
          onClick={onClose}
        >
          <X aria-hidden="true" size={12} strokeWidth={2.5} />
        </button>
      ) : null}
    </span>
  );
};
