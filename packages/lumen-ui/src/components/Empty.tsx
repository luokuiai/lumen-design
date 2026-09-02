import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from './classNames';

export type EmptySize = 'sm' | 'md' | 'lg';

export interface EmptyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode | false;
  action?: React.ReactNode;
  size?: EmptySize;
  bordered?: boolean;
}

const emptySizeClassNames: Record<EmptySize, {
  root: string;
  icon: string;
  iconSize: number;
  title: string;
}> = {
  sm: { root: 'px-4 py-4', icon: 'h-10 w-10', iconSize: 19, title: 'text-[13px]' },
  md: { root: 'px-5 py-8', icon: 'h-12 w-12', iconSize: 22, title: 'text-[14px]' },
  lg: { root: 'px-6 py-12', icon: 'h-14 w-14', iconSize: 25, title: 'text-[16px]' },
};

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  (
    {
      title = '暂无数据',
      description,
      icon,
      action,
      size = 'md',
      bordered = false,
      className,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = emptySizeClassNames[size];
    const iconNode = icon === false
      ? null
      : icon ?? <Inbox aria-hidden="true" size={sizeClasses.iconSize} />;

    return (
      <div
        {...props}
        ref={ref}
        data-ui="empty"
        data-size={size}
        className={cn(
          'flex min-w-0 flex-col items-center justify-center text-center',
          sizeClasses.root,
          bordered && 'rounded-[8px] border border-dashed border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-subtle)]',
          className,
        )}
      >
        {iconNode ? (
          <span
            className={cn(
              'mb-3 flex items-center justify-center rounded-[8px] text-[var(--lumen-color-text-placeholder)]',
              sizeClasses.icon,
            )}
          >
            {iconNode}
          </span>
        ) : null}
        {title ? (
          <div className={cn('font-normal leading-5 text-[var(--lumen-color-text)]', sizeClasses.title)}>
            {title}
          </div>
        ) : null}
        {description ? (
          <div className="mt-1 max-w-[440px] text-[13px] font-normal leading-5 text-[var(--lumen-color-text-muted)]">
            {description}
          </div>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    );
  },
);

Empty.displayName = 'Empty';
