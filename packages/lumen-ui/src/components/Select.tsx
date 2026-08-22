import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, LoaderCircle, Search, X } from 'lucide-react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';
import { dropdownTransformOrigin } from './dropdownMotion';

const DROPDOWN_CLOSE_ANIMATION_MS = 120;
const SHOULD_SKIP_CLOSE_ANIMATION_IN_TEST = import.meta.env.MODE === 'test';

/** 选项定义 */
export interface SelectOption<T extends string | number = string> {
  /** 显示文本 */
  label: string;
  /** 选项值 */
  value: T;
  /** 分组标题 */
  group?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选项图标 */
  icon?: React.ReactNode;
  /** 附加描述文本 */
  description?: string;
}

/** 选择器模式 */
export type SelectMode = 'single' | 'multiple';

/** 选择器尺寸 */
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOptionRenderState {
  /** 是否已选中 */
  selected: boolean;
  /** 是否键盘或鼠标高亮 */
  highlighted: boolean;
  /** 是否禁用 */
  disabled: boolean;
  /** 选项索引 */
  index: number;
}

/** 选择器 Props */
export interface SelectProps<T extends string | number = string> {
  /** 选项列表 */
  options: SelectOption<T>[];
  /** 选择器模式: 单选 / 多选 */
  mode?: SelectMode;
  /** 是否启用搜索过滤 */
  searchable?: boolean;
  /** 占位提示文本 */
  placeholder?: string;
  /** 是否禁用整个组件 */
  disabled?: boolean;
  /** 当前选中值 (单选模式为 T | null, 多选模式为 T[]) */
  value: T | null | T[];
  /** 多选触发器展示方式 */
  multipleTriggerDisplay?: 'chips' | 'count' | 'placeholder';
  /** 多选计数文案 */
  multipleCountLabel?: (count: number) => string;
  /** 选中值变更回调 */
  onChange: (value: T | null | T[]) => void;
  /** 选择器尺寸 */
  size?: SelectSize;
  /** 额外 className */
  className?: string;
  /** 自定义触发器 className */
  triggerClassName?: string;
  /** 自定义触发器圆角，默认 rounded-[6px] */
  radius?: string;
  /** 打开前执行，可用于预加载选项 */
  onBeforeOpen?: () => Promise<void> | void;
  /** 搜索输入框占位文本 */
  searchPlaceholder?: string;
  /** 空状态文本 */
  emptyText?: string;
  /** 是否按搜索词本地过滤选项 */
  filterOptions?: boolean;
  /** 加载状态文本 */
  loadingText?: string;
  /** 是否正在加载选项 */
  loading?: boolean;
  /** 外部受控搜索值 */
  searchValue?: string;
  /** 搜索值变化回调 */
  onSearchChange?: (value: string) => void;
  /** 开合状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 自定义触发器内容 */
  renderTrigger?: (selectedOptions: SelectOption<T>[]) => React.ReactNode;
  /** 自定义选项内容 */
  renderOption?: (
    option: SelectOption<T>,
    state: SelectOptionRenderState,
  ) => React.ReactNode;
  /** 自定义选项按钮样式 */
  optionClassName?: (
    option: SelectOption<T>,
    state: SelectOptionRenderState,
  ) => string | undefined;
  /** 可访问名称 */
  'aria-label'?: string;
}

const selectSizeTokens: Record<SelectSize, string> = {
  sm: 'min-h-[32px] px-3 text-[12px]',
  md: 'min-h-[36px] px-3 text-[13px]',
  lg: 'min-h-[40px] px-3.5 text-[14px]',
};

export const Select = <T extends string | number = string>({
  options,
  mode = 'single',
  searchable = false,
  placeholder = '请选择',
  disabled = false,
  value,
  multipleTriggerDisplay = 'chips',
  multipleCountLabel = (count) => `已选择 ${count} 项`,
  onChange,
  size = 'md',
  className,
  triggerClassName,
  radius,
  onBeforeOpen,
  searchPlaceholder = '搜索...',
  emptyText = '无匹配选项',
  filterOptions = true,
  loadingText = '加载中...',
  loading = false,
  searchValue,
  onSearchChange,
  onOpenChange,
  renderTrigger,
  renderOption,
  optionClassName,
  'aria-label': ariaLabel,
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isPreparingOpen, setIsPreparingOpen] = useState(false);
  const [shouldDropUp, setShouldDropUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const effectiveSearchQuery = searchValue ?? searchQuery;

  // 将 value 标准化为数组
  const selectedValues = useMemo<T[]>(() => {
    if (mode === 'multiple') return Array.isArray(value) ? value : [];
    if (value == null) return [];
    return [value as T];
  }, [mode, value]);

  // 按搜索词过滤选项
  const filteredOptions = useMemo(() => {
    if (!filterOptions || !effectiveSearchQuery) return options;
    const q = effectiveSearchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [filterOptions, options, effectiveSearchQuery]);

  const updateSearchQuery = useCallback(
    (value: string) => {
      if (searchValue === undefined) {
        setSearchQuery(value);
      }
      onSearchChange?.(value);
    },
    [onSearchChange, searchValue],
  );

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const estimatedDropdownHeight =
      240 +
      (searchable ? 58 : 0) +
      (mode === 'multiple' && selectedValues.length > 0 ? 46 : 0) +
      12;
    const dropdownHeight =
      portalRef.current?.offsetHeight || estimatedDropdownHeight;
    const gap = 6;
    const viewportPadding = 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const nextShouldDropUp = spaceBelow < dropdownHeight;
    const top = nextShouldDropUp
      ? Math.max(viewportPadding, rect.top - dropdownHeight - gap)
      : Math.min(window.innerHeight - viewportPadding, rect.bottom + gap);
    const availableWidth = Math.max(0, window.innerWidth - viewportPadding * 2);
    const triggerWidth = Math.min(rect.width, availableWidth);
    const maxWidth = Math.max(
      triggerWidth,
      Math.min(availableWidth, 480),
    );
    const measuredWidth = Math.min(
      maxWidth,
      Math.max(triggerWidth, portalRef.current?.offsetWidth || triggerWidth),
    );
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - measuredWidth - viewportPadding),
    );

    setShouldDropUp(nextShouldDropUp);
    setDropdownStyle({
      position: 'fixed',
      top,
      left,
      width: 'max-content',
      minWidth: triggerWidth,
      maxWidth,
      zIndex: 9999,
    });
  }, [mode, searchable, selectedValues.length]);

  // 关闭下拉（带动画）
  const closeDropdown = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (SHOULD_SKIP_CLOSE_ANIMATION_IN_TEST) {
      setIsOpen(false);
      setIsAnimatingOut(false);
      updateSearchQuery('');
      setHighlightedIndex(-1);
      onOpenChange?.(false);
      return;
    }
    setIsAnimatingOut(true);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
      updateSearchQuery('');
      setHighlightedIndex(-1);
      onOpenChange?.(false);
    }, DROPDOWN_CLOSE_ANIMATION_MS);
  }, [onOpenChange, updateSearchQuery]);

  // 立即关闭下拉（无动画）
  const closeDropdownImmediate = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(false);
    setIsAnimatingOut(false);
    updateSearchQuery('');
    setHighlightedIndex(-1);
    onOpenChange?.(false);
  }, [onOpenChange, updateSearchQuery]);

  // 打开下拉
  const openDropdown = useCallback(async () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (onBeforeOpen) {
      setIsPreparingOpen(true);
      try {
        await onBeforeOpen();
      } finally {
        setIsPreparingOpen(false);
      }
    }
    setIsOpen(true);
    setIsAnimatingOut(false);
    updateSearchQuery('');
    setHighlightedIndex(-1);
    onOpenChange?.(true);
  }, [onBeforeOpen, onOpenChange, updateSearchQuery]);

  // 选择处理
  const handleSelect = useCallback(
    (optionValue: T) => {
      if (mode === 'single') {
        onChange(optionValue);
        closeDropdownImmediate();
      } else {
        const isSelected = selectedValues.includes(optionValue);
        if (isSelected) {
          onChange(selectedValues.filter((v) => v !== optionValue));
        } else {
          onChange([...selectedValues, optionValue]);
        }
      }
    },
    [mode, onChange, selectedValues, closeDropdownImmediate],
  );

  // 移除 chip（多选）
  const handleRemoveChip = useCallback(
    (optionValue: T, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(selectedValues.filter((v) => v !== optionValue));
    },
    [onChange, selectedValues],
  );

  // 清空全部（多选）
  const handleClearAll = useCallback(() => {
    onChange([]);
    setSearchQuery('');
  }, [onChange]);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      closeDropdown();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closeDropdown]);

  // 搜索框自动聚焦
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) return;

    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);

    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const frameId = window.requestAnimationFrame(() => {
      updateDropdownPosition();
    });

    if (!portalRef.current || typeof ResizeObserver === 'undefined') {
      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const observer = new ResizeObserver(() => {
      updateDropdownPosition();
    });
    observer.observe(portalRef.current);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [
    isOpen,
    updateDropdownPosition,
    filteredOptions.length,
    searchable,
    selectedValues.length,
  ]);

  // 过滤选项变化时重置高亮索引
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDropdown();
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          closeDropdownImmediate();
          break;
        case 'Enter':
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredOptions.length
          ) {
            const opt = filteredOptions[highlightedIndex];
            if (opt && !opt.disabled) handleSelect(opt.value);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (
              next < filteredOptions.length &&
              filteredOptions[next]?.disabled
            )
              next++;
            return next >= filteredOptions.length ? prev : next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && filteredOptions[next]?.disabled) next--;
            return next < 0 ? prev : next;
          });
          break;
      }
    },
    [
      isOpen,
      highlightedIndex,
      filteredOptions,
      handleSelect,
      closeDropdownImmediate,
      openDropdown,
    ],
  );

  // 查找选项
  const findOption = useCallback(
    (val: T) => options.find((o) => o.value === val),
    [options],
  );

  // 渲染单选触发器
  const renderSingleTrigger = () => {
    if (renderTrigger) {
      return renderTrigger(
        selectedValues
          .map((val) => findOption(val))
          .filter(Boolean) as SelectOption<T>[],
      );
    }
    if (selectedValues.length === 0) {
      return (
        <span className="min-w-0 flex-1 truncate text-[var(--lumen-color-text-placeholder)]">
          {placeholder}
        </span>
      );
    }
    const selectedValue = selectedValues[0];
    const selected =
      selectedValue === undefined ? undefined : findOption(selectedValue);
    return (
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
        <span className="truncate text-[var(--lumen-color-text)]">{selected?.label}</span>
      </div>
    );
  };

  // 渲染多选触发器（chips）
  const renderMultiTrigger = () => {
    if (multipleTriggerDisplay === 'placeholder') {
      return (
        <div className="flex min-w-0 flex-1 py-1">
          <span className="truncate text-[var(--lumen-color-text-placeholder)]">{placeholder}</span>
        </div>
      );
    }
    if (multipleTriggerDisplay === 'count') {
      return (
        <div className="flex min-w-0 flex-1 py-1">
          {selectedValues.length > 0 ? (
            <span className="truncate text-[var(--lumen-color-text)]">
              {multipleCountLabel(selectedValues.length)}
            </span>
          ) : (
            <span className="text-[var(--lumen-color-text-placeholder)]">{placeholder}</span>
          )}
        </div>
      );
    }
    return (
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 py-1">
        {selectedValues.length > 0 ? (
          selectedValues.map((val) => {
            const opt = findOption(val);
            return (
              <span
                key={String(val)}
                className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--lumen-color-primary-soft)] px-2 py-0.5 text-[13px] text-[var(--lumen-color-primary)]"
              >
                {opt?.label ?? String(val)}
                <X
                  size={12}
                  className="cursor-pointer text-[var(--lumen-color-primary)]/60 hover:text-[var(--lumen-color-primary)]"
                  onClick={(e) => handleRemoveChip(val, e)}
                />
              </span>
            );
          })
        ) : (
          <span className="text-[var(--lumen-color-text-placeholder)]">{placeholder}</span>
        )}
      </div>
    );
  };

  // 渲染搜索区
  const renderSearchSection = () => (
    <div className="border-b border-[var(--lumen-color-surface-muted)] p-2.5">
      <div className="flex items-center gap-2 rounded-[8px] bg-[var(--lumen-color-surface-muted)] px-3 py-2">
        <Search size={14} className="shrink-0 text-[var(--lumen-color-text-placeholder)]" />
        <input
          ref={searchInputRef}
          className="w-full bg-transparent text-[13px] text-[var(--lumen-color-text)] outline-none placeholder:text-[var(--lumen-color-text-placeholder)]"
          placeholder={searchPlaceholder}
          value={effectiveSearchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );

  // 渲染选项
  const renderOptionNode = (option: SelectOption<T>, index: number) => {
    const isSelected = selectedValues.includes(option.value);
    const isHighlighted = index === highlightedIndex;
    const state: SelectOptionRenderState = {
      selected: isSelected,
      highlighted: isHighlighted,
      disabled: Boolean(option.disabled),
      index,
    };

    if (mode === 'multiple') {
      return (
        <button
          key={String(option.value)}
          type="button"
          disabled={option.disabled}
          onClick={() => !option.disabled && handleSelect(option.value)}
          onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
          className={cn(
            renderOption
              ? 'block w-full text-left transition-all'
              : 'flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-left text-[13px] transition-colors',
            option.disabled && 'cursor-not-allowed opacity-40',
            !renderOption &&
              (isSelected
                ? 'bg-[var(--lumen-color-primary-soft)] text-[var(--lumen-color-primary)]'
                : 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-surface-muted)]'),
            !renderOption &&
              isHighlighted &&
              !option.disabled &&
              !isSelected &&
              'bg-[var(--lumen-color-surface-muted)]',
            optionClassName?.(option, state),
          )}
        >
          {renderOption ? (
            renderOption(option, state)
          ) : (
            <>
              <div
                className={cn(
                  'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                  isSelected
                    ? 'border-[var(--lumen-color-primary)] bg-[var(--lumen-color-primary)]'
                    : 'border-[var(--lumen-color-border-strong)]',
                )}
              >
                {isSelected && <Check size={12} className="text-[var(--lumen-color-on-primary)]" />}
              </div>
              {option.icon && <span className="shrink-0">{option.icon}</span>}
              <div className="min-w-0 flex-1">
                <div className="leading-5">{option.label}</div>
                {option.description && (
                  <div className="text-[12px] text-[var(--lumen-color-text-placeholder)]">
                    {option.description}
                  </div>
                )}
              </div>
            </>
          )}
        </button>
      );
    }

    return (
      <button
        key={String(option.value)}
        type="button"
        disabled={option.disabled}
        onClick={() => !option.disabled && handleSelect(option.value)}
        onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
        className={cn(
          renderOption
            ? 'block w-full text-left transition-all'
            : 'flex w-full items-center gap-2 rounded-[8px] pl-3 pr-2 py-2.5 text-left text-[13px] transition-colors',
          option.disabled && 'cursor-not-allowed opacity-40',
          !renderOption &&
            (isSelected
              ? 'bg-[var(--lumen-color-primary-soft)] font-medium text-[var(--lumen-color-primary)]'
              : 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-surface-muted)]'),
          !renderOption &&
            isHighlighted &&
            !option.disabled &&
            !isSelected &&
            'bg-[var(--lumen-color-surface-muted)]',
          optionClassName?.(option, state),
        )}
      >
        {renderOption ? (
          renderOption(option, state)
        ) : (
          <>
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <div className="min-w-0 flex-1">
              <div className="leading-5">{option.label}</div>
              {option.description && (
                <div className="text-[12px] text-[var(--lumen-color-text-placeholder)]">
                  {option.description}
                </div>
              )}
            </div>
          </>
        )}
      </button>
    );
  };

  // 渲染空状态
  const renderEmptyState = () => (
    <div className="px-3 py-4 text-center text-[13px] text-[var(--lumen-color-text-placeholder)]">
      {emptyText}
    </div>
  );

  // 渲染底部栏（多选）
  const renderFooter = () => (
    <div className="flex items-center justify-between border-t border-[var(--lumen-color-surface-muted)] px-3 py-2.5">
      <span className="text-[12px] text-[var(--lumen-color-text-placeholder)]">
        已选 {selectedValues.length} 项
      </span>
      <button
        type="button"
        onClick={handleClearAll}
        className="text-[12px] text-[var(--lumen-color-text-placeholder)] transition-colors hover:text-[var(--lumen-color-text-muted)]"
      >
        清空
      </button>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onKeyDown={handleKeyDown}
    >
      {/* 触发器 */}
      <button
        type="button"
        data-testid="select-trigger"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => {
          if (disabled || isPreparingOpen) return;
          if (isOpen) closeDropdown();
          else openDropdown();
        }}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2 border bg-[var(--lumen-color-surface)] text-left outline-none transition-all',
          radius ?? radiusTokens.control,
          selectSizeTokens[size],
          disabled || isPreparingOpen
            ? 'cursor-not-allowed border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)] opacity-50'
            : isOpen
              ? 'border-[var(--lumen-color-primary)] ring-1 ring-[var(--lumen-color-primary)]/10'
              : 'border-[var(--lumen-color-border)] hover:border-[var(--lumen-color-border-hover)]',
          triggerClassName,
        )}
      >
        {mode === 'multiple' ? renderMultiTrigger() : renderSingleTrigger()}
        {loading || isPreparingOpen ? (
          <LoaderCircle
            size={16}
            className="shrink-0 animate-spin text-[var(--lumen-color-text-placeholder)]"
          />
        ) : (
          <ChevronDown
            size={16}
            className={cn(
              'shrink-0 text-[var(--lumen-color-text-placeholder)] transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        )}
      </button>

      {/* 下拉面板 */}
      {isOpen &&
        createPortal(
          <div
            ref={portalRef}
            data-testid="select-dropdown"
            className={cn(
              radiusTokens.card,
              'border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[0_8px_30px_var(--lumen-color-shadow)]',
            )}
            style={{
              ...dropdownStyle,
              animation: isAnimatingOut
                ? shouldDropUp
                  ? 'lumen-dropdown-out-up 0.12s ease-in forwards'
                  : 'lumen-dropdown-out 0.12s ease-in forwards'
                : shouldDropUp
                  ? 'lumen-dropdown-in-up 0.12s ease-out'
                  : 'lumen-dropdown-in 0.12s ease-out',
              transformOrigin: dropdownTransformOrigin(shouldDropUp),
            }}
          >
            {searchable && renderSearchSection()}

            <div className="max-h-[252px] overflow-y-auto px-2.5 py-1.5">
              {loading ? (
                <div className="px-3 py-4 text-center text-[13px] text-[var(--lumen-color-text-placeholder)]">
                  {loadingText}
                </div>
              ) : filteredOptions.length === 0 ? (
                renderEmptyState()
              ) : (
                filteredOptions.map((option, index) => {
                  const previousGroup = filteredOptions[index - 1]?.group;
                  const shouldRenderGroup = option.group && option.group !== previousGroup;
                  return (
                    <React.Fragment key={String(option.value)}>
                      {shouldRenderGroup && (
                        <div className="px-3 pb-1 pt-2 text-[11px] font-medium text-[var(--lumen-color-text-placeholder)]">
                          {option.group}
                        </div>
                      )}
                      {renderOptionNode(option, index)}
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {mode === 'multiple' && selectedValues.length > 0 && renderFooter()}
          </div>,
          document.body,
        )}
    </div>
  );
};
