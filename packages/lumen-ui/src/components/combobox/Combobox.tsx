import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronsUpDown, LoaderCircle, Plus, X } from 'lucide-react';
import { cn } from '../classNames';
import { radiusTokens } from '../designTokens';
import { dropdownTransformOrigin } from '../dropdownMotion';
import { useOverlayPortalScope } from '../useOverlayBehavior';
import { useLumenLocale } from '../../i18n';

const CLOSE_ANIMATION_MS = 120;
const SHOULD_SKIP_CLOSE_ANIMATION_IN_TEST = import.meta.env.MODE === 'test';

export type ComboboxOptionValue = string | number;
export type ComboboxSize = 'sm' | 'md' | 'lg';

export interface ComboboxOption<T extends ComboboxOptionValue = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface ComboboxOptionRenderState {
  selected: boolean;
  highlighted: boolean;
  disabled: boolean;
  index: number;
}

export interface ComboboxProps<T extends ComboboxOptionValue = string> {
  options: ComboboxOption<T>[];
  value: T | string | null;
  onChange: (
    value: T | string | null,
    option: ComboboxOption<T> | null,
  ) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  allowCustomValue?: boolean;
  onCreateOption?: (value: string) => void;
  filterOptions?: boolean;
  filterOption?: (option: ComboboxOption<T>, query: string) => boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
  emptyText?: React.ReactNode;
  placeholder?: string;
  size?: ComboboxSize;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  openOnFocus?: boolean;
  autoHighlight?: boolean;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  optionClassName?: (
    option: ComboboxOption<T>,
    state: ComboboxOptionRenderState,
  ) => string | undefined;
  renderOption?: (
    option: ComboboxOption<T>,
    state: ComboboxOptionRenderState,
  ) => React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  id?: string;
  name?: string;
  required?: boolean;
  autoComplete?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const sizeTokens: Record<ComboboxSize, { root: string; text: string; icon: number }> = {
  sm: {
    root: 'min-h-[var(--lumen-control-height-sm)] px-2.5',
    text: 'text-[13px]',
    icon: 14,
  },
  md: {
    root: 'min-h-[var(--lumen-control-height-md)] px-3',
    text: 'text-[14px]',
    icon: 16,
  },
  lg: {
    root: 'min-h-[var(--lumen-control-height-lg)] px-3.5',
    text: 'text-[15px]',
    icon: 18,
  },
};

const findEnabledIndex = <T extends ComboboxOptionValue>(
  options: ComboboxOption<T>[],
  start: number,
  direction: 1 | -1,
  includeCreateOption = false,
) => {
  const itemCount = options.length + (includeCreateOption ? 1 : 0);
  if (!itemCount) return -1;
  let index = start;
  for (let step = 0; step < itemCount; step += 1) {
    index = (index + direction + itemCount) % itemCount;
    if (includeCreateOption && index === options.length) return index;
    if (!options[index]?.disabled) return index;
  }
  return -1;
};

const ComboboxInner = <T extends ComboboxOptionValue = string>(
  {
    options,
    value,
    onChange,
    inputValue,
    defaultInputValue,
    onInputValueChange,
    allowCustomValue = false,
    onCreateOption,
    filterOptions = true,
    filterOption,
    loading = false,
    loadingText: loadingTextProp,
    emptyText: emptyTextProp,
    placeholder,
    size = 'md',
    disabled = false,
    invalid = false,
    clearable = true,
    openOnFocus = true,
    autoHighlight = true,
    className,
    inputClassName,
    dropdownClassName,
    optionClassName,
    renderOption,
    onOpenChange,
    id,
    name,
    required,
    autoComplete = 'off',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
  }: ComboboxProps<T>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) => {
  const locale = useLumenLocale();
  const generatedId = useId();
  const inputId = id ?? `${generatedId}-input`;
  const listboxId = `${inputId}-listbox`;
  const overlayScopeId = useOverlayPortalScope();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const composingRef = useRef(false);
  const previousValueRef = useRef(value);
  const [internalInputValue, setInternalInputValue] = useState(() => {
    const selected = options.find((option) => option.value === value);
    if (defaultInputValue !== undefined) return defaultInputValue;
    if (selected) return selected.label;
    return allowCustomValue && typeof value === 'string' ? value : '';
  });
  const [open, setOpen] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    zIndex: 9999,
  });
  const effectiveInputValue = inputValue ?? internalInputValue;
  const tokens = sizeTokens[size];
  const comboboxLocale = locale.combobox ?? {
    placeholder: locale.select.searchPlaceholder,
    emptyText: locale.select.emptyText,
    loadingText: locale.select.loadingText,
    open: 'Open options',
    close: 'Close options',
  };
  const resolvedPlaceholder = placeholder ?? comboboxLocale.placeholder;
  const loadingText = loadingTextProp ?? comboboxLocale.loadingText;
  const emptyText = emptyTextProp ?? comboboxLocale.emptyText;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const query = effectiveInputValue.trim();
    if (!filterOptions || !query) return options;
    if (filterOption) return options.filter((option) => filterOption(option, query));
    const normalizedQuery = query.toLocaleLowerCase();
    return options.filter((option) =>
      option.label.toLocaleLowerCase().includes(normalizedQuery));
  }, [effectiveInputValue, filterOption, filterOptions, options]);
  const customValue = effectiveInputValue.trim();
  const canCreateCustomValue = allowCustomValue
    && Boolean(customValue)
    && !options.some((option) =>
      option.label.localeCompare(customValue, undefined, { sensitivity: 'accent' }) === 0
      || String(option.value) === customValue);
  const createOptionIndex = canCreateCustomValue ? filteredOptions.length : -1;

  const setInput = useCallback((nextValue: string) => {
    if (inputValue === undefined) setInternalInputValue(nextValue);
    onInputValueChange?.(nextValue);
  }, [inputValue, onInputValueChange]);

  const restoreCommittedValue = useCallback(() => {
    if (selectedOption) {
      setInput(selectedOption.label);
    } else if (!allowCustomValue) {
      setInput('');
    }
  }, [allowCustomValue, selectedOption, setInput]);

  const setInputElementRef = useCallback((element: HTMLInputElement | null) => {
    inputRef.current = element;
    if (typeof forwardedRef === 'function') forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  }, [forwardedRef]);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (open && !animatingOut) return;
    if (open) {
      setAnimatingOut(false);
      return;
    }
    setPositioned(false);
    setOpen(true);
    setAnimatingOut(false);
    onOpenChange?.(true);
  }, [animatingOut, disabled, onOpenChange, open]);

  const closeDropdown = useCallback((restore = false, immediate = false) => {
    if (!open) return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (restore) restoreCommittedValue();
    setHighlightedIndex(-1);
    if (immediate || SHOULD_SKIP_CLOSE_ANIMATION_IN_TEST) {
      setOpen(false);
      setAnimatingOut(false);
      onOpenChange?.(false);
      return;
    }
    setAnimatingOut(true);
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setAnimatingOut(false);
      onOpenChange?.(false);
    }, CLOSE_ANIMATION_MS);
  }, [onOpenChange, open, restoreCommittedValue]);

  const updateDropdownPosition = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const viewportPadding = 8;
    const gap = 6;
    const availableWidth = Math.max(0, window.innerWidth - viewportPadding * 2);
    const width = Math.min(Math.max(rect.width, 220), Math.min(availableWidth, 480));
    const measuredHeight = dropdownRef.current?.offsetHeight || 256;
    const shouldDropUp = window.innerHeight - rect.bottom < measuredHeight
      && rect.top > window.innerHeight - rect.bottom;
    const top = shouldDropUp
      ? Math.max(viewportPadding, rect.top - measuredHeight - gap)
      : Math.min(window.innerHeight - viewportPadding, rect.bottom + gap);
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
    );
    setDropUp(shouldDropUp);
    setDropdownStyle({ position: 'fixed', top, left, width, zIndex: 9999 });
    setPositioned(true);
  }, []);

  const selectOption = useCallback((option: ComboboxOption<T>) => {
    if (option.disabled) return;
    onChange(option.value, option);
    setInput(option.label);
    closeDropdown(false, true);
  }, [closeDropdown, onChange, setInput]);

  const commitCustomValue = useCallback(() => {
    if (!canCreateCustomValue) return false;
    onCreateOption?.(customValue);
    onChange(customValue, null);
    setInput(customValue);
    closeDropdown(false, true);
    return true;
  }, [canCreateCustomValue, closeDropdown, customValue, onChange, onCreateOption, setInput]);

  const moveHighlight = useCallback((direction: 1 | -1) => {
    setHighlightedIndex((current) =>
      findEnabledIndex(filteredOptions, current, direction, canCreateCustomValue));
  }, [canCreateCustomValue, filteredOptions]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (composingRef.current) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openDropdown();
      moveHighlight(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key === 'Enter' && open) {
      if (highlightedIndex === createOptionIndex && commitCustomValue()) {
        event.preventDefault();
        return;
      }
      const option = filteredOptions[highlightedIndex];
      if (option && !option.disabled) {
        event.preventDefault();
        selectOption(option);
      } else if (commitCustomValue()) {
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeDropdown(true, true);
    }
  };

  useEffect(() => {
    if (Object.is(previousValueRef.current, value)) return;
    previousValueRef.current = value;
    if (selectedOption) setInput(selectedOption.label);
    else if (allowCustomValue && typeof value === 'string') setInput(value);
    else setInput('');
  }, [allowCustomValue, selectedOption, setInput, value]);

  useEffect(() => {
    if (!open || !autoHighlight) {
      setHighlightedIndex(-1);
      return;
    }
    setHighlightedIndex(findEnabledIndex(
      filteredOptions,
      -1,
      1,
      canCreateCustomValue,
    ));
  }, [autoHighlight, canCreateCustomValue, filteredOptions, open]);

  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    const activeOption = document.getElementById(
      `${listboxId}-option-${highlightedIndex}`,
    );
    activeOption?.scrollIntoView?.({ block: 'nearest' });
  }, [highlightedIndex, listboxId, open]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || dropdownRef.current?.contains(target)) return;
      closeDropdown(true);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeDropdown, open]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(updateDropdownPosition);
    const observer = dropdownRef.current && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateDropdownPosition)
      : null;
    if (dropdownRef.current) observer?.observe(dropdownRef.current);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [filteredOptions.length, loading, open, updateDropdownPosition]);

  useEffect(() => () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, []);

  const showClear = clearable && !disabled && (effectiveInputValue || value !== null);
  const activeOptionId = highlightedIndex >= 0
    ? `${listboxId}-option-${highlightedIndex}`
    : undefined;
  const rootStateClassName = invalid
    ? 'border-[var(--lumen-color-danger)] focus-within:border-[var(--lumen-color-danger)] focus-within:ring-2 focus-within:ring-[var(--lumen-color-danger)]/10'
    : 'border-[var(--lumen-color-border)] hover:border-[var(--lumen-color-border-hover)] focus-within:border-[var(--lumen-color-primary)] focus-within:ring-2 focus-within:ring-[var(--lumen-color-primary)]/10';

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      data-ui="combobox-dropdown"
      data-testid="combobox-dropdown"
      data-lumen-overlay-scope={overlayScopeId ?? undefined}
      className={cn(
        'overflow-hidden rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-lg',
        dropdownClassName,
      )}
      style={{
        ...dropdownStyle,
        visibility: positioned ? 'visible' : 'hidden',
        animation: animatingOut
          ? dropUp
            ? 'lumen-dropdown-out-up 0.12s ease-in forwards'
            : 'lumen-dropdown-out 0.12s ease-in forwards'
          : dropUp
            ? 'lumen-dropdown-in-up 0.12s ease-out'
            : 'lumen-dropdown-in 0.12s ease-out',
        transformOrigin: dropdownTransformOrigin(dropUp),
      }}
    >
      <div
        id={listboxId}
        role="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : inputId}
        className="lumen-scrollbar flex max-h-60 flex-col gap-1 overflow-y-auto p-2"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-3 py-6 text-[13px] text-[var(--lumen-color-text-muted)]">
            <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
            {loadingText}
          </div>
        ) : filteredOptions.length || canCreateCustomValue ? <>
          {filteredOptions.map((option, index) => {
          const selected = option.value === value;
          const highlighted = index === highlightedIndex;
          const state: ComboboxOptionRenderState = {
            selected,
            highlighted,
            disabled: Boolean(option.disabled),
            index,
          };
          return (
            <button
              key={String(option.value)}
              id={`${listboxId}-option-${index}`}
              type="button"
              role="option"
              aria-selected={selected}
              disabled={option.disabled}
              data-ui="combobox-option"
              data-selected={selected || undefined}
              data-highlighted={highlighted || undefined}
              className={cn(
                renderOption
                  ? 'block w-full text-left transition-colors'
                  : 'flex w-full items-center gap-2 rounded-[8px] p-2 text-left text-[14px] transition-colors',
                option.disabled && 'cursor-not-allowed opacity-40',
                !renderOption && selected && 'bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]',
                !renderOption && highlighted && !selected && !option.disabled && 'bg-[var(--lumen-color-surface-muted)]',
                !renderOption && !selected && 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-surface-muted)]',
                optionClassName?.(option, state),
              )}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
              onClick={() => selectOption(option)}
            >
              {renderOption ? renderOption(option, state) : (
                <>
                  {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate leading-5">{option.label}</span>
                    {option.description ? (
                      <span className="block truncate text-[12px] text-[var(--lumen-color-text-placeholder)]">
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                  {selected ? <Check aria-hidden="true" size={15} className="shrink-0" /> : null}
                </>
              )}
            </button>
            );
          })}
          {canCreateCustomValue ? (
            <button
              id={`${listboxId}-option-${createOptionIndex}`}
              type="button"
              role="option"
              aria-selected="false"
              data-ui="combobox-create-option"
              data-highlighted={highlightedIndex === createOptionIndex || undefined}
              className={cn(
                'flex w-full items-center gap-2 rounded-[8px] p-2 text-left text-[14px] text-[var(--lumen-color-primary)] transition-colors hover:bg-[var(--lumen-color-surface-muted)]',
                highlightedIndex === createOptionIndex && 'bg-[var(--lumen-color-surface-muted)]',
              )}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(createOptionIndex)}
              onClick={() => commitCustomValue()}
            >
              <Plus aria-hidden="true" size={15} className="shrink-0" />
              <span className="truncate">{customValue}</span>
            </button>
          ) : null}
        </> : (
          <div className="px-3 py-6 text-center text-[13px] text-[var(--lumen-color-text-muted)]">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={rootRef} data-ui="combobox" className={cn('relative w-full', className)}>
      <div
        data-ui="combobox-control"
        data-size={size}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          'flex w-full items-center gap-2 border bg-[var(--lumen-color-surface)] transition-all',
          radiusTokens.control,
          tokens.root,
          tokens.text,
          disabled
            ? 'cursor-not-allowed border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-placeholder)]'
            : rootStateClassName,
        )}
      >
        <input
          ref={setInputElementRef}
          data-ui="combobox-input"
          id={inputId}
          name={name}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={open ? activeOptionId : undefined}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={resolvedPlaceholder}
          value={effectiveInputValue}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-[var(--lumen-color-text)] outline-none placeholder:text-[var(--lumen-color-text-placeholder)] disabled:cursor-not-allowed',
            inputClassName,
          )}
          onFocus={() => {
            if (openOnFocus) openDropdown();
          }}
          onBlur={() => {
            window.requestAnimationFrame(() => {
              const activeElement = document.activeElement;
              if (
                !rootRef.current?.contains(activeElement)
                && !dropdownRef.current?.contains(activeElement)
              ) {
                closeDropdown(true);
              }
            });
          }}
          onClick={() => openDropdown()}
          onChange={(event) => {
            setInput(event.target.value);
            if (!open) openDropdown();
          }}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
        />
        {showClear ? (
          <button
            type="button"
            aria-label={locale.common.clear}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--lumen-color-text-placeholder)] hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange(null, null);
              setInput('');
              inputRef.current?.focus();
              openDropdown();
            }}
          >
            <X aria-hidden="true" size={tokens.icon} />
          </button>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? comboboxLocale.close : comboboxLocale.open}
          aria-expanded={open}
          disabled={disabled}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--lumen-color-text-placeholder)] hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text-secondary)] disabled:cursor-not-allowed focus:outline-none"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) closeDropdown(true);
            else {
              inputRef.current?.focus();
              if (!openOnFocus) openDropdown();
            }
          }}
        >
          <ChevronsUpDown aria-hidden="true" size={tokens.icon} />
        </button>
      </div>
      {dropdown && typeof document !== 'undefined'
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
};

const ForwardedCombobox = React.forwardRef(ComboboxInner);
ForwardedCombobox.displayName = 'Combobox';

export const Combobox = ForwardedCombobox as <
  T extends ComboboxOptionValue = string,
>(
  props: ComboboxProps<T> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement;
