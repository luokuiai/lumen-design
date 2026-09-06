import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from './Button';
import { cn } from './classNames';
import {
  floatingButtonIconSizeTokens,
  type ButtonSize,
  type ButtonVariant,
} from './designTokens';
import { useLumenLocale } from '../i18n';

export type FabPosition = 'fixed' | 'absolute' | 'static';
export type FabPlacement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';
export type FabMenuDirection = 'up' | 'down' | 'start' | 'end';

interface FabActionBase
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children' | 'color'> {
  icon: React.ReactNode;
  color?: string;
  extended?: boolean;
  foregroundColor?: string;
  closeOnClick?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export type FabAction = FabActionBase & FabAccessibleContent;

interface FabBaseProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children' | 'color'> {
  icon: React.ReactNode;
  active?: boolean;
  color?: string;
  extended?: boolean;
  foregroundColor?: string;
  loading?: boolean;
  loadingLabel?: string;
  actions?: readonly FabAction[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  menuDirection?: FabMenuDirection;
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
    icon: floatingButtonIconSizeTokens.sm,
    extended: '!h-9 !rounded-[var(--lumen-radius-pill)] px-3.5 text-[13px]',
  },
  md: {
    icon: floatingButtonIconSizeTokens.md,
    extended: '!h-11 !rounded-[var(--lumen-radius-pill)] px-[18px] text-[14px]',
  },
  lg: {
    icon: floatingButtonIconSizeTokens.lg,
    extended: '!h-[52px] !rounded-[var(--lumen-radius-pill)] px-[22px] text-[15px]',
  },
};

const fabMenuDirectionClassNames: Record<FabMenuDirection, { root: string; menu: string }> = {
  up: { root: 'flex-col-reverse', menu: 'flex-col-reverse' },
  down: { root: 'flex-col', menu: 'flex-col' },
  start: { root: 'flex-row-reverse', menu: 'flex-row-reverse' },
  end: { root: 'flex-row', menu: 'flex-row' },
};

const fabMenuClosedClassNames: Record<FabMenuDirection, string> = {
  up: 'translate-y-3',
  down: '-translate-y-3',
  start: 'translate-x-3',
  end: '-translate-x-3',
};

const toCssLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value;

export const Fab: React.FC<FabProps> = ({
  icon,
  label,
  active = true,
  color,
  extended: extendedProp,
  foregroundColor,
  loading = false,
  loadingLabel,
  actions = [],
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  menuDirection,
  position = 'fixed',
  placement = 'bottom-end',
  offset = 16,
  safeArea = true,
  size = 'sm',
  variant = 'primary',
  className,
  disabled,
  onClick,
  style,
  'aria-label': ariaLabel,
  ...props
}) => {
  const locale = useLumenLocale();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const resolvedLoadingLabel = loadingLabel ?? locale.accessibility.loading;
  const extended = extendedProp ?? (label !== undefined && label !== null);
  const hasActions = actions.length > 0;
  const open = hasActions && (openProp ?? uncontrolledOpen);
  const resolvedMenuDirection = menuDirection ?? (placement.startsWith('bottom') ? 'up' : 'down');
  const offsetValue = toCssLength(offset);
  const positioned = position !== 'static';
  const placementStyle: React.CSSProperties = {};
  const colorStyle: React.CSSProperties = color ? {
    backgroundColor: color,
    color: foregroundColor ?? 'var(--lumen-color-on-primary)',
  } : foregroundColor ? { color: foregroundColor } : {};

  if (positioned) {
    const verticalOffset = safeArea
      ? `calc(${offsetValue} + env(safe-area-inset-${placement.startsWith('bottom') ? 'bottom' : 'top'}))`
      : offsetValue;
    if (placement.startsWith('bottom')) placementStyle.bottom = verticalOffset;
    else placementStyle.top = verticalOffset;
    if (placement.endsWith('end')) placementStyle.insetInlineEnd = offsetValue;
    else placementStyle.insetInlineStart = offsetValue;
  }

  const setOpen = useCallback((nextOpen: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [onOpenChange, openProp]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      rootRef.current?.querySelector<HTMLButtonElement>('[data-fab-trigger]')?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, setOpen]);

  const sharedProps = {
    ...props,
    disabled: disabled || loading,
    hidden: !active,
    variant,
    size,
    icon: loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : icon,
    className: cn(
      '!border-0 shadow-[0_3px_10px_var(--lumen-color-shadow)] hover:-translate-y-0.5 hover:shadow-[0_5px_16px_var(--lumen-color-shadow)]',
      color && 'hover:brightness-95',
      hasActions && '[&>span:first-child]:transition-transform [&>span:first-child]:duration-200 [&>span:first-child]:ease-out',
      open && '[&>span:first-child]:rotate-45',
      fabPositionClassNames[hasActions ? 'static' : position],
      extended ? fabSizeClassNames[size].extended : fabSizeClassNames[size].icon,
      className,
    ),
    style: hasActions
      ? { ...colorStyle, ...style }
      : { ...placementStyle, ...colorStyle, ...style },
    'aria-busy': loading || undefined,
    'data-active': active,
    'data-fab': extended ? 'extended' : 'icon',
    'data-placement': placement,
    'data-position': position,
    'data-fab-trigger': hasActions || undefined,
    'aria-controls': hasActions ? menuId : undefined,
    'aria-expanded': hasActions ? open : undefined,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (hasActions && !event.defaultPrevented) setOpen(!open);
    },
  } as const;

  const trigger = extended ? (
    <Button {...sharedProps} aria-label={loading ? resolvedLoadingLabel : ariaLabel}>
      {label}
    </Button>
  ) : (
    <Button
      {...sharedProps}
      iconOnly
      aria-label={loading ? resolvedLoadingLabel : ariaLabel ?? (typeof label === 'string' ? label : locale.accessibility.fab)}
    />
  );

  if (!hasActions) return trigger;

  const directionClassNames = fabMenuDirectionClassNames[resolvedMenuDirection];
  return (
    <div
      ref={rootRef}
      hidden={!active}
      data-fab-menu-root
      data-open={open}
      data-direction={resolvedMenuDirection}
      className={cn(
        'inline-flex items-center gap-3',
        fabPositionClassNames[position],
        directionClassNames.root,
      )}
      style={placementStyle}
    >
      {trigger}
      <div
        id={menuId}
        role="group"
        aria-hidden={!open}
        aria-label={typeof label === 'string' ? label : ariaLabel}
        className={cn('flex items-center gap-2', directionClassNames.menu)}
      >
        {actions.map(({
          className: actionClassName,
          closeOnClick = true,
          extended: actionExtended,
          onClick: onActionClick,
          style: actionStyle,
          ...action
        }, index) => {
          const transitionIndex = open ? index : actions.length - index - 1;
          return (
            <Fab
              {...action}
              key={action.id ?? index}
              className={cn(
                'transition-all duration-200 ease-out',
                open
                  ? 'scale-100 opacity-100'
                  : cn('pointer-events-none scale-50 opacity-0', fabMenuClosedClassNames[resolvedMenuDirection]),
                actionClassName,
              )}
              extended={actionExtended ?? false}
              position="static"
              style={{ ...actionStyle, transitionDelay: `${transitionIndex * 40}ms` }}
              tabIndex={open ? action.tabIndex : -1}
              title={action.title ?? (typeof action.label === 'string' ? action.label : undefined)}
              onClick={(event) => {
                onActionClick?.(event);
                if (closeOnClick && !event.defaultPrevented) setOpen(false);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
