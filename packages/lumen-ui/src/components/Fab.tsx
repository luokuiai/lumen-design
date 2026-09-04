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
  extended?: boolean;
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
    icon: '!h-9 !w-9 !rounded-full p-0',
    extended: '!h-9 !rounded-[var(--lumen-radius-pill)] px-3.5 text-[13px]',
  },
  md: {
    icon: '!h-11 !w-11 !rounded-full p-0',
    extended: '!h-11 !rounded-[var(--lumen-radius-pill)] px-[18px] text-[14px]',
  },
  lg: {
    icon: '!h-[52px] !w-[52px] !rounded-full p-0',
    extended: '!h-[52px] !rounded-[var(--lumen-radius-pill)] px-[22px] text-[15px]',
  },
};

const toCssLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

export const Fab: React.FC<FabProps> = ({
  icon,
  label,
  active = true,
  extended: extendedProp,
  loading = false,
  loadingLabel = '加载中',
  position = 'fixed',
  placement = 'bottom-end',
  offset = 16,
  safeArea = true,
  size = 'sm',
  variant = 'primary',
  className,
  disabled,
  style,
  'aria-label': ariaLabel,
  ...props
}) => {
  const extended = extendedProp ?? (label !== undefined && label !== null);
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
      aria-label={loading ? loadingLabel : ariaLabel ?? (typeof label === 'string' ? label : '浮动操作')}
    />
  );
};
