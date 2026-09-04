import { Search } from 'lucide-react';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Modal } from '../Modal';
import { Scrollbar } from '../Scrollbar';
import { cn } from '../classNames';

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: React.ReactNode;
  shortcut?: React.ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  heading?: React.ReactNode;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandPaletteGroup[];
  label?: string;
  placeholder?: string;
  emptyText?: React.ReactNode;
  loading?: boolean;
  loadingText?: React.ReactNode;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  closeOnSelect?: boolean;
  loop?: boolean;
  enableShortcut?: boolean;
  shortcutKey?: string;
  className?: string;
}

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  groups,
  label = '命令面板',
  placeholder = '搜索命令...',
  emptyText = '没有匹配的命令',
  loading = false,
  loadingText = '加载中...',
  searchValue,
  onSearchValueChange,
  closeOnSelect = true,
  loop = true,
  enableShortcut = false,
  shortcutKey = 'k',
  className,
}) => {
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const listboxId = useId();
  const optionIdPrefix = useId();
  const effectiveSearchValue = searchValue ?? internalSearchValue;

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (node && open) node.focus();
  }, [open]);

  const updateSearchValue = useCallback(
    (value: string) => {
      if (searchValue === undefined) setInternalSearchValue(value);
      onSearchValueChange?.(value);
    },
    [onSearchValueChange, searchValue],
  );

  const filteredGroups = useMemo(() => {
    const query = normalize(effectiveSearchValue);
    if (!query) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          normalize([item.label, item.description, ...(item.keywords ?? [])].filter(Boolean).join(' '))
            .includes(query),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [effectiveSearchValue, groups]);

  const visibleItems = useMemo(
    () => filteredGroups.flatMap((group) => group.items),
    [filteredGroups],
  );
  const visibleItemsKey = visibleItems.map((item) => `${item.id}:${item.disabled ? 1 : 0}`).join('|');
  const firstEnabledIndex = visibleItems.findIndex((item) => !item.disabled);

  useEffect(() => {
    setActiveIndex(firstEnabledIndex < 0 ? 0 : firstEnabledIndex);
  }, [effectiveSearchValue, firstEnabledIndex, visibleItemsKey]);

  useEffect(() => {
    const activeOption = panelRef.current?.querySelector<HTMLElement>(
      '[role="option"][aria-selected="true"]',
    );
    activeOption?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const frameId = window.requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(frameId);
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!enableShortcut) return;
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === shortcutKey.toLocaleLowerCase()) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [enableShortcut, onOpenChange, open, shortcutKey]);

  const selectItem = useCallback(
    (item: CommandPaletteItem) => {
      if (item.disabled) return;
      item.onSelect();
      if (closeOnSelect) onOpenChange(false);
    },
    [closeOnSelect, onOpenChange],
  );

  const moveActiveItem = useCallback(
    (direction: 1 | -1) => {
      if (visibleItems.every((item) => item.disabled)) return;
      let nextIndex = activeIndex;
      do {
        nextIndex += direction;
        if (loop) {
          nextIndex = (nextIndex + visibleItems.length) % visibleItems.length;
        } else if (nextIndex < 0 || nextIndex >= visibleItems.length) {
          return;
        }
      } while (visibleItems[nextIndex]?.disabled);
      setActiveIndex(nextIndex);
    },
    [activeIndex, loop, visibleItems],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActiveItem(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActiveItem(-1);
    } else if (event.key === 'Enter') {
      const activeItem = visibleItems[activeIndex];
      if (activeItem && !activeItem.disabled) {
        event.preventDefault();
        selectItem(activeItem);
      }
    }
  };

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') {
      handleKeyDown(event as React.KeyboardEvent<HTMLInputElement>);
      return;
    }
    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('input, button:not(:disabled)') ?? [],
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  let itemIndex = -1;

  return (
    <Modal
      open={open}
      onRequestClose={() => onOpenChange(false)}
      modalId="command-palette"
      overlayClassName="items-start pt-[max(12vh,3rem)]"
      panelClassName="w-full max-w-[640px]"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-ui="command-palette"
        className={cn(
          'isolate w-full overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] text-[var(--lumen-color-text)] shadow-[var(--lumen-shadow-modal)]',
          className,
        )}
        onKeyDown={handlePanelKeyDown}
      >
        <div className="flex h-12 items-center gap-3 border-b border-[var(--lumen-color-border)] px-4">
          <Search aria-hidden="true" className="shrink-0 text-[var(--lumen-color-text-muted)]" size={18} />
          <input
            ref={setInputRef}
            role="combobox"
            aria-autocomplete="list"
            aria-label={placeholder}
            aria-controls={listboxId}
            aria-expanded={open}
            aria-activedescendant={visibleItems[activeIndex] ? `${optionIdPrefix}-${activeIndex}` : undefined}
            value={effectiveSearchValue}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[16px] text-[var(--lumen-color-text)] outline-none placeholder:text-[var(--lumen-color-text-placeholder)] pad:text-[14px]"
            onChange={(event) => updateSearchValue(event.target.value)}
          />
        </div>

        <Scrollbar
          id={listboxId}
          role="listbox"
          aria-label={label}
          size="sm"
          autoHide
          tabIndex={-1}
          className="max-h-[min(420px,60dvh)] p-2"
        >
          {loading ? (
            <div role="status" className="px-3 py-8 text-center text-[13px] text-[var(--lumen-color-text-muted)]">
              {loadingText}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-[var(--lumen-color-text-muted)]">
              {emptyText}
            </div>
          ) : (
            filteredGroups.map((group, groupIndex) => (
              <div key={groupIndex} role="group" aria-labelledby={group.heading ? `${listboxId}-group-${groupIndex}` : undefined}>
                {group.heading ? (
                  <div id={`${listboxId}-group-${groupIndex}`} className="px-2 pb-1 pt-2 text-[11px] font-semibold text-[var(--lumen-color-text-muted)]">
                    {group.heading}
                  </div>
                ) : null}
                {group.items.map((item) => {
                  itemIndex += 1;
                  const currentIndex = itemIndex;
                  const selected = currentIndex === activeIndex;
                  return (
                    <button
                      key={item.id}
                      id={`${optionIdPrefix}-${currentIndex}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={item.disabled}
                      className={cn(
                        'flex min-h-10 w-full items-center gap-3 rounded-[6px] px-3 py-2 text-left outline-none transition-colors',
                        selected && 'bg-[var(--lumen-color-surface-hover)]',
                        item.disabled
                          ? 'cursor-not-allowed opacity-45'
                          : 'cursor-pointer hover:bg-[var(--lumen-color-surface-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--lumen-color-primary)]/30',
                      )}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                      onClick={() => selectItem(item)}
                    >
                      {item.icon ? <span className="shrink-0 text-[var(--lumen-color-text-muted)]">{item.icon}</span> : null}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">{item.label}</span>
                        {item.description ? (
                          <span className="mt-0.5 block truncate text-[12px] text-[var(--lumen-color-text-muted)]">{item.description}</span>
                        ) : null}
                      </span>
                      {item.shortcut ? (
                        <span className="shrink-0 text-[11px] text-[var(--lumen-color-text-placeholder)]">{item.shortcut}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </Scrollbar>
      </div>
    </Modal>
  );
};
