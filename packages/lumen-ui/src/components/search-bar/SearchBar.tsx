import { LoaderCircle, Search, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useLumenLocale } from '../../i18n';
import { cn } from '../classNames';
import type { InputSize } from '../Input';

export interface SearchBarProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'defaultValue' | 'onChange' | 'prefix' | 'size' | 'type' | 'value'
  > {
  /** 受控模式下的搜索关键词。 */
  value?: string;
  /** 非受控模式下的初始搜索关键词。 */
  defaultValue?: string;
  /** 搜索关键词变化时触发。 */
  onChange?: (value: string) => void;
  /** 提交搜索时触发。 */
  onSearch?: (value: string) => void;
  /** 清空搜索关键词时触发。 */
  onClear?: () => void;
  /** 搜索栏尺寸。 */
  size?: InputSize;
  /** 是否显示清空按钮。 */
  clearable?: boolean;
  /** 是否处于加载状态。 */
  loading?: boolean;
  /** 自定义前置内容；传入 null 可隐藏默认搜索图标。 */
  prefix?: React.ReactNode | null;
  /** 自定义后置内容。 */
  suffix?: React.ReactNode;
  /** 输入元素附加类名。 */
  inputClassName?: string;
  /** 清空按钮的无障碍名称。 */
  clearLabel?: string;
}

const sizeClassNames: Record<InputSize, string> = {
  sm: 'h-[var(--lumen-control-height-sm)] px-2.5 text-[13px] mobile:text-[16px]',
  md: 'h-[var(--lumen-control-height-md)] px-3 text-[14px] mobile:text-[16px]',
  lg: 'h-[var(--lumen-control-height-lg)] px-3.5 text-[15px] mobile:text-[16px]',
};

const iconSizes: Record<InputSize, number> = { sm: 15, md: 17, lg: 19 };

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      onSearch,
      onClear,
      size = 'md',
      clearable = true,
      loading = false,
      prefix,
      suffix,
      inputClassName,
      clearLabel,
      placeholder,
      className,
      disabled,
      readOnly,
      onKeyDown,
      ...props
    },
    forwardedRef,
  ) => {
    const locale = useLumenLocale();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const controlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = controlled ? value : internalValue;
    const iconSize = iconSizes[size];

    const setInputRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    const commitValue = (nextValue: string) => {
      if (!controlled) setInternalValue(nextValue);
      onChange?.(nextValue);
    };

    const clear = () => {
      if (disabled || readOnly || loading) return;
      commitValue('');
      onClear?.();
      inputRef.current?.focus();
    };

    return (
      <div
        role="search"
        data-ui="search-bar"
        data-size={size}
        data-loading={loading || undefined}
        data-disabled={disabled || undefined}
        className={cn('w-full', className)}
      >
        <div
          className={cn(
            'flex w-full items-center gap-2 rounded-full border border-transparent bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text)] shadow-[var(--lumen-shadow-control)] transition-[box-shadow,background-color]',
            sizeClassNames[size],
            disabled
              ? 'cursor-not-allowed text-[var(--lumen-color-text-placeholder)] opacity-70'
              : 'hover:bg-[var(--lumen-color-surface)] focus-within:bg-[var(--lumen-color-surface-muted)] focus-within:shadow-[var(--lumen-shadow-control)]',
          )}
        >
          {prefix !== null ? (
            <span className="flex shrink-0 items-center text-[var(--lumen-color-text-placeholder)]">
              {prefix === undefined ? <Search aria-hidden="true" size={iconSize} /> : prefix}
            </span>
          ) : null}
          <input
            {...props}
            ref={setInputRef}
            type="search"
            value={currentValue}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder ?? locale.select.searchPlaceholder}
            aria-busy={loading || undefined}
            className={cn(
              'min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-inherit outline-none placeholder:text-[var(--lumen-color-text-placeholder)] [&::-webkit-search-cancel-button]:hidden disabled:cursor-not-allowed',
              inputClassName,
            )}
            onChange={(event) => commitValue(event.currentTarget.value)}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (!event.defaultPrevented && event.key === 'Escape' && currentValue) {
                event.preventDefault();
                clear();
              } else if (!event.defaultPrevented && event.key === 'Enter' && !disabled && !loading) {
                event.preventDefault();
                onSearch?.(currentValue);
              }
            }}
          />
          {loading ? (
            <LoaderCircle
              aria-label={locale.common.loading}
              className="shrink-0 animate-spin text-[var(--lumen-color-text-placeholder)]"
              size={iconSize}
            />
          ) : null}
          {!loading && clearable && currentValue ? (
            <button
              type="button"
              aria-label={clearLabel ?? locale.common.clear}
              disabled={disabled || readOnly}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--lumen-color-text-placeholder)] transition-colors hover:bg-[var(--lumen-color-surface)] hover:text-[var(--lumen-color-text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed"
              onPointerDown={(event) => event.preventDefault()}
              onClick={clear}
            >
              <X aria-hidden="true" size={iconSize} />
            </button>
          ) : null}
          {suffix ? (
            <span className="flex shrink-0 items-center text-[var(--lumen-color-text-muted)]">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    );
  },
);

SearchBar.displayName = 'SearchBar';
