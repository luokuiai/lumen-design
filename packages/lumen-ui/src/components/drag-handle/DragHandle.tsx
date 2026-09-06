import { Grip, GripHorizontal, GripVertical } from 'lucide-react';
import React from 'react';
import { useLumenLocale } from '../../i18n';
import { cn } from '../classNames';

export type DragHandleAxis = 'vertical' | 'horizontal' | 'both';
export type DragHandleSize = 'sm' | 'md' | 'lg';

export interface DragHandleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** 拖拽排序的主要方向。 */
  axis?: DragHandleAxis;
  /** 手柄尺寸。 */
  size?: DragHandleSize;
  /** 是否正在拖动。 */
  active?: boolean;
  /** 自定义手柄图标。 */
  icon?: React.ReactNode;
  /** 自定义无障碍名称。 */
  label?: string;
}

const sizeClassNames: Record<DragHandleSize, string> = {
  sm: 'h-7 w-6',
  md: 'h-8 w-7',
  lg: 'h-9 w-8',
};

const iconSizes: Record<DragHandleSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const DragHandle = React.forwardRef<HTMLButtonElement, DragHandleProps>(
  (
    {
      axis = 'vertical',
      size = 'md',
      active = false,
      icon,
      label,
      className,
      disabled,
      type = 'button',
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const locale = useLumenLocale();
    const Icon = axis === 'vertical'
      ? GripVertical
      : axis === 'horizontal'
        ? GripHorizontal
        : Grip;

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={disabled}
        aria-label={ariaLabel ?? label ?? locale.accessibility.dragHandle ?? 'Drag to reorder'}
        data-ui="drag-handle"
        data-axis={axis}
        data-size={size}
        data-active={active || undefined}
        className={cn(
          'inline-flex shrink-0 touch-none select-none items-center justify-center rounded-[var(--lumen-radius-icon)] border border-transparent text-[var(--lumen-color-text-muted)] outline-none transition-[color,background-color,border-color,box-shadow,transform] hover:bg-[var(--lumen-color-surface-hover)] hover:text-[var(--lumen-color-text)] focus-visible:border-[var(--lumen-color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40',
          active
            ? 'cursor-grabbing bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-primary)] shadow-[var(--lumen-shadow-control)]'
            : 'cursor-grab',
          sizeClassNames[size],
          className,
        )}
      >
        {icon ?? <Icon aria-hidden="true" size={iconSizes[size]} strokeWidth={2.2} />}
      </button>
    );
  },
);

DragHandle.displayName = 'DragHandle';
