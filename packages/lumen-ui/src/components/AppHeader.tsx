import React from 'react';
import { cn } from './classNames';

export interface AppHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  navigation?: React.ReactNode;
  search?: React.ReactNode;
  actions?: React.ReactNode;
}

export const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  (
    {
      title,
      description,
      navigation,
      search,
      actions,
      className,
      ...props
    },
    ref,
  ) => (
    <header
      {...props}
      ref={ref}
      data-ui="app-header"
      className={cn(
        'flex min-w-0 items-center justify-between gap-5 border-b border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-glass)] px-6 py-4 mobile:flex-col mobile:items-stretch mobile:gap-3 mobile:px-3 mobile:py-3',
        className,
      )}
    >
      <div
        data-ui="app-header-heading"
        className="flex min-w-0 items-center gap-2.5"
      >
        {navigation ? (
          <div
            data-ui="app-header-navigation"
            className="flex shrink-0 items-center gap-1"
          >
            {navigation}
          </div>
        ) : null}
        <div className="min-w-0">
          <h1
            data-ui="app-header-title"
            className="m-0 truncate text-[20px] font-medium leading-[1.25] text-[var(--lumen-color-text-strong)]"
          >
            {title}
          </h1>
          {description ? (
            <p
              data-ui="app-header-description"
              className="mb-0 mt-1.5 truncate text-[12px] leading-[1.55] text-[var(--lumen-color-text-muted)]"
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {search || actions ? (
        <div
          data-ui="app-header-end"
          className="flex min-w-0 items-center gap-4 mobile:flex-wrap"
        >
          {search ? (
            <div
              data-ui="app-header-search"
              className="min-w-0 mobile:w-full mobile:basis-full"
            >
              {search}
            </div>
          ) : null}
          {actions ? (
            <div
              data-ui="app-header-actions"
              className="flex shrink-0 items-center gap-2 mobile:ml-auto"
            >
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  ),
);

AppHeader.displayName = 'AppHeader';
