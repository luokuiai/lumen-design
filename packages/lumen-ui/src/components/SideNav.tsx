import React, { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./classNames";
import { sideNavClassNames } from "./designTokens";
import { Tooltip } from "./Tooltip";
import { useLumenLocale } from "../i18n";

export interface SideNavItem<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  href?: string;
  disabled?: boolean;
  /** 子菜单；有子项时作为可展开分组。 */
  children?: SideNavItem<T>[];
}

export interface SideNavSection<T extends string = string> {
  title?: string;
  items: SideNavItem<T>[];
}

export interface SideNavProps<T extends string = string> {
  sections: SideNavSection<T>[];
  activeValue?: T;
  /** 收起为图标导航；点击分组前往首个可用子项。 */
  collapsed?: boolean;
  /** 受控的已展开分组。 */
  expandedValues?: T[];
  /** 非受控模式下默认展开的分组。 */
  defaultExpandedValues?: T[];
  /** 分组展开状态变化时触发。 */
  onExpandedValuesChange?: (values: T[]) => void;
  ariaLabel?: string;
  className?: string;
  itemClassName?: string;
  onSelect?: (value: T, item: SideNavItem<T>) => void;
}

const containsValue = <T extends string>(items: SideNavItem<T>[], value?: T): boolean =>
  items.some((item) => item.value === value || (item.children && containsValue(item.children, value)));

const firstEnabledItem = <T extends string>(items: SideNavItem<T>[]): SideNavItem<T> | undefined => {
  for (const item of items) {
    if (item.disabled) continue;
    if (!item.children?.length) return item;
    const child = firstEnabledItem(item.children);
    if (child) return child;
  }
  return undefined;
};

export const SideNav = <T extends string>({
  sections,
  activeValue,
  collapsed = false,
  expandedValues,
  defaultExpandedValues = [],
  onExpandedValuesChange,
  ariaLabel,
  className,
  itemClassName,
  onSelect,
}: SideNavProps<T>) => {
  const locale = useLumenLocale();
  const id = useId();
  const [internalExpandedValues, setInternalExpandedValues] = useState(defaultExpandedValues);
  const openValues = expandedValues ?? internalExpandedValues;

  const toggleGroup = (value: T) => {
    const next = openValues.includes(value)
      ? openValues.filter((entry) => entry !== value)
      : [...openValues, value];
    if (expandedValues === undefined) setInternalExpandedValues(next);
    onExpandedValuesChange?.(next);
  };

  const renderItems = (
    items: SideNavItem<T>[],
    path: string,
    depth = 0,
    parentDisabled = false,
    visible = true,
  ): React.ReactNode => items.map((item, index) => {
    const children = item.children ?? [];
    const group = children.length > 0;
    const active = item.value === activeValue;
    const activeGroup = group && containsValue(children, activeValue);
    const expanded = !collapsed && openValues.includes(item.value);
    const childPath = `${path}-${index}`;
    const childrenId = `${id}-children-${childPath}`;
    const target = collapsed && group ? firstEnabledItem(children) : item;
    const disabled = parentDisabled || item.disabled || !target;
    const Icon = item.icon;
    const itemClasses = cn(
      sideNavClassNames.item,
      collapsed ? sideNavClassNames.collapsedItem
        : depth > 0 ? sideNavClassNames.childItem : sideNavClassNames.expandedItem,
      active || (collapsed && activeGroup) ? sideNavClassNames.activeItem
        : activeGroup ? sideNavClassNames.activeGroup : sideNavClassNames.inactiveItem,
      disabled && sideNavClassNames.disabledItem,
      itemClassName,
    );
    const content = (
      <>
        {Icon ? <Icon aria-hidden="true" className="shrink-0" size={18} strokeWidth={1.75} /> : collapsed ? (
          <span aria-hidden="true" className="text-[13px] font-normal">{item.label.slice(0, 1)}</span>
        ) : null}
        <span className={collapsed ? "sr-only" : "min-w-0 flex-1 truncate"}>{item.label}</span>
        {group && !collapsed ? (
          <ChevronDown
            aria-hidden="true"
            size={16}
            className={cn("shrink-0 transition-transform duration-[160ms] motion-reduce:transition-none", expanded && "rotate-180")}
          />
        ) : null}
      </>
    );
    const handleSelect = () => {
      if (disabled) return;
      if (group && !collapsed) toggleGroup(item.value);
      else if (target) onSelect?.(target.value, target);
    };
    const itemProps = {
      "aria-current": active && !group ? "page" as const : undefined,
      "aria-label": collapsed ? item.label : undefined,
      "aria-expanded": group && !collapsed ? expanded : undefined,
      "aria-controls": group && !collapsed ? childrenId : undefined,
      "data-side-nav-item": "",
      "data-side-nav-group": group || undefined,
      "data-active": active || activeGroup || undefined,
      "data-depth": depth,
      tabIndex: visible ? undefined : -1,
      className: itemClasses,
      onClick: handleSelect,
    };
    const itemNode = target?.href && !disabled && (!group || collapsed) ? (
      <a {...itemProps} href={target.href}>{content}</a>
    ) : (
      <button {...itemProps} type="button" disabled={disabled}>{content}</button>
    );

    return (
      <div key={item.value} className="min-w-0">
        {collapsed ? <Tooltip content={item.label} placement="right">{itemNode}</Tooltip> : itemNode}
        {group && !collapsed ? (
          <div
            id={childrenId}
            data-side-nav-children
            aria-hidden={!expanded || undefined}
            inert={!expanded}
            className="grid transition-[grid-template-rows,opacity] duration-[220ms] motion-reduce:transition-none"
            style={{ gridTemplateRows: expanded ? "1fr" : "0fr", opacity: expanded ? 1 : 0 }}
          >
            <div className="min-h-0 overflow-hidden">
              <div className={sideNavClassNames.children}>
                {renderItems(children, childPath, depth + 1, disabled, visible && expanded)}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  });

  return (
    <nav
      aria-label={ariaLabel ?? locale.navigation.sideNav}
      data-ui="side-nav"
      data-collapsed={collapsed || undefined}
      className={cn(sideNavClassNames.root, collapsed && "items-center", className)}
    >
      {sections.map((section, sectionIndex) => (
        <div
          key={section.title ?? sectionIndex}
          data-side-nav-section
          className={sideNavClassNames.section}
        >
          {section.title ? collapsed ? (
            <div className={sideNavClassNames.collapsedDivider} aria-hidden="true" />
          ) : (
            <div className={sideNavClassNames.sectionTitle}>{section.title}</div>
          ) : null}
          {renderItems(section.items, String(sectionIndex))}
        </div>
      ))}
    </nav>
  );
};
