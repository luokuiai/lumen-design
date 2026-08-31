import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from './classNames';
import { sideNavClassNames } from './designTokens';
import { Tooltip } from './Tooltip';

export interface SideNavItem<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  href?: string;
  disabled?: boolean;
}

export interface SideNavSection<T extends string = string> {
  title?: string;
  items: SideNavItem<T>[];
}

export interface SideNavProps<T extends string = string> {
  sections: SideNavSection<T>[];
  activeValue?: T;
  collapsed?: boolean;
  ariaLabel?: string;
  className?: string;
  itemClassName?: string;
  onSelect?: (value: T, item: SideNavItem<T>) => void;
}

export const SideNav = <T extends string>({
  sections,
  activeValue,
  collapsed = false,
  ariaLabel = '侧边导航',
  className,
  itemClassName,
  onSelect,
}: SideNavProps<T>) => (
  <nav
    aria-label={ariaLabel}
    data-ui="side-nav"
    data-collapsed={collapsed || undefined}
    className={cn(sideNavClassNames.root, className)}
  >
    {sections.map((section, sectionIndex) => (
      <div
        key={section.title ?? sectionIndex}
        data-side-nav-section
        className={sideNavClassNames.section}
      >
        {section.title ? (
          collapsed ? (
            <div className={sideNavClassNames.collapsedDivider} aria-hidden="true" />
          ) : (
            <div className={sideNavClassNames.sectionTitle}>{section.title}</div>
          )
        ) : null}
        {section.items.map((item) => {
          const active = item.value === activeValue;
          const Icon = item.icon;
          const itemClasses = cn(
            sideNavClassNames.item,
            collapsed ? sideNavClassNames.collapsedItem : sideNavClassNames.expandedItem,
            active ? sideNavClassNames.activeItem : sideNavClassNames.inactiveItem,
            item.disabled ? sideNavClassNames.disabledItem : '',
            itemClassName,
          );
          const content = (
            <>
              {Icon ? (
                <Icon aria-hidden="true" className="shrink-0" size={19} />
              ) : collapsed ? (
                <span aria-hidden="true" className="text-[13px] font-normal">
                  {item.label.slice(0, 1)}
                </span>
              ) : null}
              <span className={collapsed ? 'sr-only' : 'min-w-0 truncate'}>{item.label}</span>
            </>
          );
          const handleSelect = () => {
            if (!item.disabled) onSelect?.(item.value, item);
          };
          const itemNode = item.href && !item.disabled ? (
            <a
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? item.label : undefined}
              data-side-nav-item
              className={itemClasses}
              onClick={handleSelect}
            >
              {content}
            </a>
          ) : (
            <button
              type="button"
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? item.label : undefined}
              data-side-nav-item
              disabled={item.disabled}
              className={itemClasses}
              onClick={handleSelect}
            >
              {content}
            </button>
          );

          return collapsed ? (
            <Tooltip key={item.value} content={item.label} placement="right">
              {itemNode}
            </Tooltip>
          ) : (
            <React.Fragment key={item.value}>{itemNode}</React.Fragment>
          );
        })}
      </div>
    ))}
  </nav>
);
