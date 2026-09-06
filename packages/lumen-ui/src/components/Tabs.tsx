import React, { useEffect, useRef } from 'react';
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
  idPrefix?: string;
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
  idPrefix,
}: TabsProps<T>) => {
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const styles = tabVariantClassNames[variant];
  const resolvedGridClassName =
    gridClassName ??
    (variant === 'card'
      ? 'grid grid-cols-1 gap-2 pad:grid-cols-2 l:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5 xxxl:grid-cols-6'
      : 'flex items-center gap-2 overflow-x-auto overflow-y-hidden');

  useEffect(() => {
    const tabList = tabListRef.current;
    const activeTab = activeTabRef.current;
    if (!tabList || !activeTab) return;
    if (tabList.scrollWidth <= tabList.clientWidth) return;

    const listBounds = tabList.getBoundingClientRect();
    const tabBounds = activeTab.getBoundingClientRect();
    const edgePadding = 4;
    let delta = 0;
    if (tabBounds.left < listBounds.left + edgePadding) {
      delta = tabBounds.left - listBounds.left - edgePadding;
    } else if (tabBounds.right > listBounds.right - edgePadding) {
      delta = tabBounds.right - listBounds.right + edgePadding;
    }
    if (delta === 0) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    tabList.scrollTo({
      left: tabList.scrollLeft + delta,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [value]);

  return (
    <div data-ui="tabs-surface" className={cn(styles.container, className)}>
      <div className={cn('flex flex-col gap-3 pad:gap-4 l:flex-row l:items-center l:justify-between')}>
        <div
          ref={tabListRef}
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
                ref={active ? activeTabRef : undefined}
                id={idPrefix ? `${idPrefix}-tab-${option.value}` : undefined}
                role="tab"
                aria-controls={idPrefix ? `${idPrefix}-panel-${option.value}` : undefined}
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
        {aside ? <div className="min-w-0 l:shrink-0">{aside}</div> : null}
      </div>
    </div>
  );
};
