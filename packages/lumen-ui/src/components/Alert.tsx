import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CircleAlert,
  Info,
  X,
} from 'lucide-react';
import { cn } from './classNames';
import { semanticSurfaceToneClassNames } from './designTokens';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  icon?: React.ReactNode | false;
  action?: React.ReactNode;
  closeLabel?: string;
  onClose?: () => void;
}

const alertIcons = {
  info: Info,
  success: CheckCircle2,
  warning: CircleAlert,
  danger: AlertCircle,
} as const;

const alertIconClassNames: Record<AlertVariant, string> = {
  info: 'text-[var(--lumen-color-primary)]',
  success: 'text-[var(--lumen-color-success)]',
  warning: 'text-[var(--lumen-color-warning)]',
  danger: 'text-[var(--lumen-color-danger)]',
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      icon,
      action,
      closeLabel = '关闭提示',
      onClose,
      children,
      className,
      role,
      ...props
    },
    ref,
  ) => {
    const Icon = alertIcons[variant];
    const resolvedRole = role ?? (variant === 'warning' || variant === 'danger' ? 'alert' : 'status');
    const iconNode = icon === false ? null : icon ?? <Icon aria-hidden="true" size={18} />;

    return (
      <div
        {...props}
        ref={ref}
        role={resolvedRole}
        data-ui="alert"
        data-variant={variant}
        className={cn(
          'flex min-w-0 items-start gap-3 rounded-[8px] border px-4 py-3',
          semanticSurfaceToneClassNames[variant],
          className,
        )}
      >
        {iconNode ? (
          <span
            className={cn(
              'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center',
              alertIconClassNames[variant],
            )}
          >
            {iconNode}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 pad:flex pad:items-start pad:justify-between pad:gap-4">
          <div className="min-w-0">
            {title ? (
              <div className="text-[13px] font-medium leading-5">{title}</div>
            ) : null}
            {children ? (
              <div
                className={cn(
                  'text-[13px] font-normal leading-5 text-[var(--lumen-color-text-secondary)]',
                  title && 'mt-0.5',
                )}
              >
                {children}
              </div>
            ) : null}
          </div>
          {action ? <div className="mt-3 shrink-0 pad:mt-0">{action}</div> : null}
        </div>
        {onClose ? (
          <button
            type="button"
            aria-label={closeLabel}
            className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-current opacity-65 transition-colors hover:bg-current/10 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current/25"
            onClick={onClose}
          >
            <X aria-hidden="true" size={15} />
          </button>
        ) : null}
      </div>
    );
  },
);

Alert.displayName = 'Alert';
