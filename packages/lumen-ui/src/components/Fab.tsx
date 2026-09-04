import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from './Button';
import { cn } from './classNames';
import type { ButtonSize, ButtonVariant } from './designTokens';

export type FabPosition = 'fixed' | 'absolute' | 'static';
export type FabPlacement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';

interface FabBaseProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  icon: React.ReactNode;
  active?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  position?: FabPosition;
  placement?: FabPlacement;
  offset?: number | string;
  safeArea?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

type FabAccessibleContent =
  | { label: React.ReactNode; 'aria-label'?: string }
  | { label?: never; 'aria-label': string };

export type FabProps = FabBaseProps & FabAccessibleContent;

const fabPositionClassNames: Record<FabPosition, string> = {
  fixed: 'fixed z-50',
  absolute: 'absolute z-10',
  static: 'relative',
};

const fabSizeClassNames: Record<ButtonSize, { icon: string; extended: string }> = {
  sm: {
    icon: '!h-10 !w-10 !rounded-full p-0',
    extended: '!h-10 !rounded-[var(--lumen-radius-pill)] px-4 text-[13px]',
  },
  md: {
    icon: '!h-12 !w-12 !rounded-full p-0',
    extended: '!h-12 !rounded-[var(--lumen-radius-pill)] px-5 text-[14px]',
  },
  lg: {
    icon: '!h-14 !w-14 !rounded-full p-0',
    extended: '!h-14 !rounded-[var(--lumen-radius-pill)] px-6 text-[15px]',
  },
};

const toCssLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

export const Fab: React.FC<FabProps> = ({
  icon,
  label,
  active = true,
  loading = false,
  loadingLabel = '加载中',
  position = 'fixed',
  placement = 'bottom-end',
  offset = 16,
  safeArea = true,
  size = 'lg',
  variant = 'primary',
  className,
  disabled,
  style,
  'aria-label': ariaLabel,
  ...props
}) => {
  const extended = label !== undefined && label !== null;
  const offsetValue = toCssLength(offset);
  const positioned = position !== 'static';
  const placementStyle: React.CSSProperties = {};

  if (positioned) {
    const verticalOffset = safeArea
      ? `calc(${offsetValue} + env(safe-area-inset-${placement.startsWith('bottom') ? 'bottom' : 'top'}))`
      : offsetValue;
    if (placement.startsWith('bottom')) placementStyle.bottom = verticalOffset;
    else placementStyle.top = verticalOffset;
    if (placement.endsWith('end')) placementStyle.insetInlineEnd = offsetValue;
    else placementStyle.insetInlineStart = offsetValue;
  }

  const sharedProps = {
    ...props,
    disabled: disabled || loading,
    hidden: !active,
    variant,
    size,
    icon: loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : icon,
    className: cn(
      'shadow-[var(--lumen-shadow-card)] hover:-translate-y-0.5',
      fabPositionClassNames[position],
      extended ? fabSizeClassNames[size].extended : fabSizeClassNames[size].icon,
      className,
    ),
    style: { ...placementStyle, ...style },
    'aria-busy': loading || undefined,
    'data-active': active,
    'data-fab': extended ? 'extended' : 'icon',
    'data-placement': placement,
    'data-position': position,
  } as const;

  return extended ? (
    <Button {...sharedProps} aria-label={loading ? loadingLabel : ariaLabel}>
      {label}
    </Button>
  ) : (
    <Button
      {...sharedProps}
      iconOnly
      aria-label={loading ? loadingLabel : ariaLabel!}
    />
  );
};
