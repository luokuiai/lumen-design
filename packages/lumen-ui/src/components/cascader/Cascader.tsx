import { Check, ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { Input } from '../Input';
import { Popover } from '../Popover';
import { Scrollbar } from '../Scrollbar';
import { cn } from '../classNames';
import { radiusTokens } from '../designTokens';

export type CascaderSize = 'sm' | 'md' | 'lg';

export interface CascaderOption<T extends string | number = string> {
  value: T;
  label: string;
  children?: CascaderOption<T>[];
  disabled?: boolean;
  icon?: React.ReactNode;
  keywords?: string[];
}

export interface CascaderProps<T extends string | number = string> {
  options: CascaderOption<T>[];
  value?: readonly T[];
  defaultValue?: readonly T[];
  onChange?: (value: T[], selectedOptions: CascaderOption<T>[]) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: React.ReactNode;
  loading?: boolean;
  loadingText?: React.ReactNode;
  size?: CascaderSize;
  separator?: string;
  displayRender?: (labels: string[], selectedOptions: CascaderOption<T>[]) => React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  panelClassName?: string;
  'aria-label'?: string;
}

const triggerSizeClassNames: Record<CascaderSize, string> = {
  sm: 'h-[var(--lumen-control-height-sm)] text-[13px]',
  md: 'h-[var(--lumen-control-height-md)] text-[14px]',
  lg: 'h-[var(--lumen-control-height-lg)] text-[15px]',
};

const optionSizeClassNames: Record<CascaderSize, string> = {
  sm: 'min-h-8 text-[13px]',
  md: 'min-h-9 text-[14px]',
  lg: 'min-h-10 text-[15px]',
};

function findPath<T extends string | number>(
  options: CascaderOption<T>[],
  values: readonly T[],
) {
  const path: CascaderOption<T>[] = [];
  let currentOptions = options;
  for (const value of values) {
    const option = currentOptions.find((item) => item.value === value);
    if (!option) return [];
    path.push(option);
    currentOptions = option.children ?? [];
  }
  return path;
}

function flattenLeafPaths<T extends string | number>(
  options: CascaderOption<T>[],
  ancestors: CascaderOption<T>[] = [],
): CascaderOption<T>[][] {
  return options.flatMap((option) => {
    const path = [...ancestors, option];
    return option.children?.length
      ? flattenLeafPaths(option.children, path)
      : [path];
  });
}

export const Cascader = <T extends string | number = string>({
  options,
  value,
  defaultValue = [],
  onChange,
  placeholder = '请选择',
  disabled = false,
  clearable = true,
  searchable = false,
  searchPlaceholder = '搜索选项',
  emptyText = '无匹配选项',
  loading = false,
  loadingText = '加载中...',
  size = 'md',
  separator = '/',
  displayRender,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  panelClassName,
  'aria-label': ariaLabel,
}: CascaderProps<T>) => {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<readonly T[]>(defaultValue);
  const selectedValues = value ?? internalValue;
  const selectedPath = useMemo(
    () => findPath(options, selectedValues),
    [options, selectedValues],
  );
  const [activePath, setActivePath] = useState<CascaderOption<T>[]>(selectedPath);
  const [searchValue, setSearchValue] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const columns = useMemo(() => {
    const result: CascaderOption<T>[][] = [options];
    activePath.forEach((option) => {
      if (option.children?.length) result.push(option.children);
    });
    return result;
  }, [activePath, options]);

  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase();
    if (!query) return [];
    return flattenLeafPaths(options).filter((path) =>
      path.some((option) =>
        [option.label, ...(option.keywords ?? [])]
          .join(' ')
          .toLocaleLowerCase()
          .includes(query),
      ),
    );
  }, [options, searchValue]);

  const commitPath = (path: CascaderOption<T>[], close: () => void) => {
    const nextValues = path.map((option) => option.value);
    if (!controlled) setInternalValue(nextValues);
    setActivePath(path);
    onChange?.(nextValues, path);
    close();
  };

  const clearValue = () => {
    if (!controlled) setInternalValue([]);
    setActivePath([]);
    onChange?.([], []);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setActivePath(selectedPath);
      setSearchValue('');
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (searchable) searchInputRef.current?.focus();
          else focusColumnOption(0);
        });
      });
    }
    onOpenChange?.(nextOpen);
  };

  const activateOption = (
    option: CascaderOption<T>,
    columnIndex: number,
    close: () => void,
  ) => {
    if (option.disabled) return;
    const nextPath = [...activePath.slice(0, columnIndex), option];
    setActivePath(nextPath);
    if (!option.children?.length) commitPath(nextPath, close);
  };

  const focusColumnOption = (columnIndex: number, optionIndex?: number) => {
    window.requestAnimationFrame(() => {
      const column = panelRef.current?.querySelector<HTMLElement>(
        `[data-cascader-column="${columnIndex}"]`,
      );
      const optionsInColumn = Array.from(
        column?.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)') ?? [],
      );
      (optionIndex === undefined
        ? optionsInColumn.find((option) => option.getAttribute('aria-selected') === 'true') ?? optionsInColumn[0]
        : optionsInColumn[optionIndex]
      )?.focus();
    });
  };

  const handleOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    option: CascaderOption<T>,
    columnIndex: number,
    close: () => void,
  ) => {
    const column = event.currentTarget.closest('[data-cascader-column]');
    const enabledOptions = Array.from(
      column?.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)') ?? [],
    );
    const currentIndex = enabledOptions.indexOf(event.currentTarget);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      enabledOptions[(currentIndex + offset + enabledOptions.length) % enabledOptions.length]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      enabledOptions[event.key === 'Home' ? 0 : enabledOptions.length - 1]?.focus();
    } else if (event.key === 'ArrowRight' && option.children?.length) {
      event.preventDefault();
      activateOption(option, columnIndex, close);
      focusColumnOption(columnIndex + 1, 0);
    } else if (event.key === 'ArrowLeft' && columnIndex > 0) {
      event.preventDefault();
      focusColumnOption(columnIndex - 1);
    }
  };

  const renderedValue = selectedPath.length
    ? displayRender?.(selectedPath.map((option) => option.label), selectedPath)
      ?? selectedPath.map((option) => option.label).join(` ${separator} `)
    : null;

  return (
    <Popover
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      placement="bottom"
      align="start"
      className={cn('w-full', className)}
      contentClassName={cn(
        '!max-w-[min(640px,calc(100vw-16px))] !overflow-hidden !p-0 min-w-[280px] w-max',
        panelClassName,
      )}
      contentRole="dialog"
      ariaLabel={ariaLabel ?? '级联选择'}
      trigger={({ open: triggerOpen, popoverId, toggle }) => (
        <div
          data-ui="cascader"
          data-size={size}
          data-open={triggerOpen || undefined}
          className={cn(
            'flex w-full items-center border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] transition-colors focus-within:border-[var(--lumen-color-primary)] focus-within:ring-1 focus-within:ring-[var(--lumen-color-primary)]/10',
            radiusTokens.control,
            triggerSizeClassNames[size],
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <button
            type="button"
            aria-label={ariaLabel}
            aria-haspopup="dialog"
            aria-expanded={triggerOpen}
            aria-controls={popoverId}
            disabled={disabled}
            className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 bg-transparent px-3 text-left outline-none disabled:cursor-not-allowed"
            onClick={toggle}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && !triggerOpen) {
                event.preventDefault();
                toggle();
              }
            }}
          >
            <span className={cn('min-w-0 flex-1 truncate', renderedValue ? 'text-[var(--lumen-color-text)]' : 'text-[var(--lumen-color-text-placeholder)]')}>
              {renderedValue ?? placeholder}
            </span>
            <ChevronDown aria-hidden="true" size={15} className={cn('shrink-0 text-[var(--lumen-color-text-muted)] transition-transform', triggerOpen && 'rotate-180')} />
          </button>
          {clearable && selectedPath.length > 0 && !disabled ? (
            <button type="button" aria-label="清除选择" className="mr-2 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-[var(--lumen-color-text-placeholder)] hover:bg-[var(--lumen-color-surface-hover)] hover:text-[var(--lumen-color-text-muted)]" onClick={clearValue}>
              <X aria-hidden="true" size={14} />
            </button>
          ) : null}
        </div>
      )}
    >
      {({ close }) => (
        <div ref={panelRef} data-ui="cascader-panel">
          {searchable ? (
            <div className="border-b border-[var(--lumen-color-border)] p-2">
              <Input
                ref={searchInputRef}
                size="sm"
                value={searchValue}
                prefix={<Search aria-hidden="true" size={14} />}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          ) : null}

          {loading ? (
            <div role="status" className="px-4 py-10 text-center text-[13px] text-[var(--lumen-color-text-muted)]">{loadingText}</div>
          ) : searchable && searchValue.trim() ? (
            <Scrollbar size="sm" autoHide tabIndex={-1} className="max-h-64 p-2" role="listbox" aria-label="搜索结果">
              {searchResults.length ? searchResults.map((path) => {
                const pathDisabled = path.some((option) => option.disabled);
                const pathKey = path.map((option) => String(option.value)).join('/');
                return (
                  <button
                    key={pathKey}
                    type="button"
                    role="option"
                    aria-selected={selectedValues.length === path.length && path.every((option, index) => option.value === selectedValues[index])}
                    disabled={pathDisabled}
                    className="flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-[6px] px-3 py-2 text-left text-[13px] text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-45"
                    onClick={() => commitPath(path, close)}
                  >
                    <span className="min-w-0 flex-1 truncate">{path.map((option) => option.label).join(` ${separator} `)}</span>
                    <ChevronRight aria-hidden="true" size={14} className="shrink-0 text-[var(--lumen-color-text-placeholder)]" />
                  </button>
                );
              }) : (
                <div className="px-4 py-10 text-center text-[13px] text-[var(--lumen-color-text-muted)]">{emptyText}</div>
              )}
            </Scrollbar>
          ) : options.length ? (
            <Scrollbar orientation="horizontal" size="sm" tabIndex={-1} className="max-w-full">
              <div className="flex w-max min-w-full">
                {columns.map((column, columnIndex) => (
                  <Scrollbar
                    key={columnIndex}
                    data-cascader-column={columnIndex}
                    size="sm"
                    autoHide
                    tabIndex={-1}
                    role="listbox"
                    aria-label={`第 ${columnIndex + 1} 级选项`}
                    className="h-64 w-48 shrink-0 border-r border-[var(--lumen-color-border)] p-1.5 last:border-r-0"
                  >
                    {column.map((option, optionIndex) => {
                      const active = activePath[columnIndex]?.value === option.value;
                      const selected = selectedPath[columnIndex]?.value === option.value;
                      const hasChildren = Boolean(option.children?.length);
                      return (
                        <button
                          key={`${String(option.value)}-${optionIndex}`}
                          type="button"
                          role="option"
                          aria-selected={active || selected}
                          disabled={option.disabled}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--lumen-color-primary)]/25 disabled:cursor-not-allowed disabled:opacity-45',
                            optionSizeClassNames[size],
                            active
                              ? 'bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]'
                              : 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-surface-hover)]',
                          )}
                          onClick={() => activateOption(option, columnIndex, close)}
                          onKeyDown={(event) => handleOptionKeyDown(event, option, columnIndex, close)}
                        >
                          {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
                          <span className="min-w-0 flex-1 truncate">{option.label}</span>
                          {selected && !hasChildren ? <Check aria-hidden="true" size={14} className="shrink-0" /> : null}
                          {hasChildren ? <ChevronRight aria-hidden="true" size={14} className="shrink-0 text-[var(--lumen-color-text-placeholder)]" /> : null}
                        </button>
                      );
                    })}
                  </Scrollbar>
                ))}
              </div>
            </Scrollbar>
          ) : (
            <div className="px-4 py-10 text-center text-[13px] text-[var(--lumen-color-text-muted)]">{emptyText}</div>
          )}
        </div>
      )}
    </Popover>
  );
};
