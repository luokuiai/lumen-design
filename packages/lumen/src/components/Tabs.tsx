import React from 'react';
import { cn } from './classNames';
import {
  tabVariantClassNames,
} from './designTokens';
import type { LucideIcon } from 'lucide-react';

export interface TabOption<T extends string> {
  value: T;
  label: string;
  count?: number | string;
  description?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface TabsProps<T extends string> {
  value: T;
  options: TabOption<T>[];
  onChange: (value: T) => void;
  variant?: keyof typeof tabVariantClassNames;
  className?: string;
  gridClassName?: string;
  itemClassName?: string;
  aside?: React.ReactNode;
}

export const Tabs = <T extends string>({
  value,
  options,
  onChange,
  variant = 'default',
  className = '',
  gridClassName,
  itemClassName = '',
  aside,
}: TabsProps<T>) => {
  const styles = tabVariantClassNames[variant];
  const resolvedGridClassName =
    gridClassName ??
    (variant === 'card'
      ? 'grid grid-cols-1 gap-2 xl:grid-cols-4'
      : 'flex items-center gap-2 overflow-x-auto');

  return (
    <div data-ui="tabs-surface" className={cn(styles.container, className)}>
      <div className={cn('flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between')}>
        <div
          role="tablist"
          data-testid="tabs-grid"
          className={cn(resolvedGridClassName, aside ? 'min-w-0 flex-1' : '')}
        >
          {options.map((option) => {
            const active = option.value === value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                role="tab"
                type="button"
                aria-selected={active}
                aria-disabled={option.disabled || undefined}
                disabled={option.disabled}
                onClick={() => {
                  if (!option.disabled) {
                    onChange(option.value);
                  }
                }}
                className={cn(
                  styles.base,
                  active ? styles.active : styles.inactive,
                  option.disabled ? 'cursor-not-allowed opacity-45 hover:translate-y-0' : '',
                  itemClassName,
                )}
              >
                {Icon ? (
                  styles.iconBase ? (
                    <span className={cn(styles.iconBase, active ? styles.iconActive : styles.iconInactive)}>
                      <Icon size={16} className="shrink-0" strokeWidth={2.2} />
                    </span>
                  ) : (
                    <Icon size={14} className="shrink-0" />
                  )
                ) : null}
                <span className={styles.iconBase ? 'leading-none' : undefined}>{option.label}</span>
                {option.count !== undefined && option.count !== null ? (
                  <span
                    className={cn(
                      styles.badgeBase,
                      active ? styles.badgeActive : styles.badgeInactive,
                    )}
                  >
                    {option.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </div>
  );
};
