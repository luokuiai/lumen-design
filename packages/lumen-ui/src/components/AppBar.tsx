import React from 'react';
import { cn } from './classNames';
import { Toolbar, type ToolbarSize } from './Toolbar';

export type AppBarPosition = 'fixed' | 'absolute' | 'sticky' | 'static';
export type AppBarTitleAlign = 'start' | 'center';

export interface AppBarProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  active?: boolean;
  position?: AppBarPosition;
  titleAlign?: AppBarTitleAlign;
  size?: ToolbarSize;
  safeArea?: boolean;
  ariaLabel?: string;
  toolbarClassName?: string;
  titleClassName?: string;
}

const appBarPositionClassNames: Record<AppBarPosition, string> = {
  fixed: 'fixed inset-x-0 top-0 z-50',
  absolute: 'absolute inset-x-0 top-0 z-10',
  sticky: 'sticky top-0 z-40',
  static: 'relative w-full',
};

export const AppBar = React.forwardRef<HTMLElement, AppBarProps>(
  (
    {
      title,
      leading,
      actions,
      active = true,
      position = 'fixed',
      titleAlign = 'center',
      size = 'lg',
      safeArea = true,
      ariaLabel = '应用栏',
      className,
      toolbarClassName,
      titleClassName,
      ...props
    },
    ref,
  ) => (
    <header
      {...props}
      ref={ref}
      data-active={active}
      data-position={position}
      data-title-align={titleAlign}
      data-ui="app-bar"
      hidden={!active}
      className={cn(
        'border-b border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[var(--lumen-shadow-control)]',
        appBarPositionClassNames[position],
        safeArea && 'pt-[env(safe-area-inset-top)]',
        className,
      )}
    >
      <Toolbar
        size={size}
        ariaLabel={ariaLabel}
        className={cn(
          '!grid w-full overflow-visible',
          titleAlign === 'center'
            ? 'grid-cols-[minmax(48px,1fr)_minmax(0,auto)_minmax(48px,1fr)]'
            : 'grid-cols-[auto_minmax(0,1fr)_auto]',
          toolbarClassName,
        )}
      >
        <div data-ui="app-bar-leading" className="flex min-w-12 items-center justify-start">
          {leading}
        </div>
        <h1
          data-ui="app-bar-title"
          className={cn(
            'm-0 min-w-0 truncate text-[17px] font-medium leading-tight text-[var(--lumen-color-text-strong)]',
            titleAlign === 'start' && 'text-left',
            titleClassName,
          )}
        >
          {title}
        </h1>
        <div data-ui="app-bar-actions" className="flex min-w-12 items-center justify-end gap-1">
          {actions}
        </div>
      </Toolbar>
    </header>
  ),
);

AppBar.displayName = 'AppBar';
