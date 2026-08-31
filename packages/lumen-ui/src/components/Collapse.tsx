import React, { createContext, useContext, useId, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './classNames';

export type CollapseDensity = 'default' | 'compact';

interface CollapseContextValue {
  openValues: string[];
  density: CollapseDensity;
  toggle: (value: string) => void;
}

const CollapseContext = createContext<CollapseContextValue | null>(null);

export interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  accordion?: boolean;
  density?: CollapseDensity;
  bordered?: boolean;
}

export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  (
    {
      value,
      defaultValue = [],
      onValueChange,
      accordion = false,
      density = 'default',
      bordered = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const controlled = Array.isArray(value);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const openValues = controlled ? value : internalValue;
    const contextValue = useMemo<CollapseContextValue>(() => ({
      openValues,
      density,
      toggle: (itemValue) => {
        const itemOpen = openValues.includes(itemValue);
        const nextValue = accordion
          ? itemOpen ? [] : [itemValue]
          : itemOpen
            ? openValues.filter((currentValue) => currentValue !== itemValue)
            : [...openValues, itemValue];
        if (!controlled) setInternalValue(nextValue);
        onValueChange?.(nextValue);
      },
    }), [accordion, controlled, density, onValueChange, openValues]);

    return (
      <CollapseContext.Provider value={contextValue}>
        <div
          {...props}
          ref={ref}
          data-ui="collapse"
          data-density={density}
          className={cn(
            'min-w-0 overflow-hidden bg-[var(--lumen-color-surface)]',
            bordered && 'rounded-[8px] border border-[var(--lumen-color-border)]',
            '[&>[data-ui=collapse-item]+[data-ui=collapse-item]]:border-t [&>[data-ui=collapse-item]+[data-ui=collapse-item]]:border-[var(--lumen-color-surface-muted)]',
            className,
          )}
        >
          {children}
        </div>
      </CollapseContext.Provider>
    );
  },
);

Collapse.displayName = 'Collapse';

export interface CollapseItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  value: string;
  title: React.ReactNode;
  extra?: React.ReactNode;
  disabled?: boolean;
}

export const CollapseItem = React.forwardRef<HTMLDivElement, CollapseItemProps>(
  ({ value, title, extra, disabled = false, className, children, ...props }, ref) => {
    const context = useContext(CollapseContext);
    const generatedId = useId();
    if (!context) throw new Error('CollapseItem must be used inside Collapse or Accordion.');
    const open = context.openValues.includes(value);
    const triggerId = `${generatedId}-trigger`;
    const panelId = `${generatedId}-panel`;
    const spacing = context.density === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3.5';

    return (
      <div
        {...props}
        ref={ref}
        data-ui="collapse-item"
        data-state={open ? 'open' : 'closed'}
        className={cn(disabled && 'opacity-50', className)}
      >
        <button
          id={triggerId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          className={cn(
            'flex w-full items-center gap-3 text-left text-[13px] font-normal text-[var(--lumen-color-text)] transition-colors hover:bg-[var(--lumen-color-surface-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed',
            spacing,
          )}
          onClick={() => context.toggle(value)}
        >
          <span className="min-w-0 flex-1">{title}</span>
          {extra ? <span className="shrink-0 text-[12px] font-normal text-[var(--lumen-color-text-muted)]">{extra}</span> : null}
          <ChevronDown
            aria-hidden="true"
            size={16}
            className={cn(
              'shrink-0 text-[var(--lumen-color-text-placeholder)] transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
          aria-hidden={!open}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              inert={!open}
              className={cn(
                'border-t border-[var(--lumen-color-surface-muted)] text-[13px] font-normal leading-6 text-[var(--lumen-color-text-secondary)]',
                context.density === 'compact' ? 'px-3 py-2.5' : 'px-4 py-3.5',
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CollapseItem.displayName = 'CollapseItem';

export interface AccordionProps
  extends Omit<CollapseProps, 'accordion' | 'defaultValue' | 'onValueChange' | 'value'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ value, defaultValue, onValueChange, ...props }, ref) => (
    <Collapse
      {...props}
      ref={ref}
      accordion
      value={value === undefined ? undefined : value ? [value] : []}
      defaultValue={defaultValue ? [defaultValue] : []}
      onValueChange={(nextValue) => onValueChange?.(nextValue[0])}
    />
  ),
);

Accordion.displayName = 'Accordion';
