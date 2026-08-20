import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';

// ─── 类型定义 ────────────────────────────────────────────

export type DatePickerMode = 'year-month' | 'year-month-day';
export type DatePickerSize = 'sm' | 'md' | 'lg';

export interface DatePickerProps {
  /** 当前值，year-month-day 模式 "YYYY-MM-DD"，year-month 模式 "YYYY-MM" */
  value: string;
  /** 值变化回调 */
  onChange: (value: string) => void;
  /** 输入框占位提示 */
  placeholder?: string;
  /** 触发按钮无障碍标签 */
  triggerAriaLabel?: string;
  /** 根元素额外 class */
  className?: string;
  /** 选择模式，默认 'year-month-day' */
  mode?: DatePickerMode;
  /** 组件尺寸，默认 'md' */
  size?: DatePickerSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示清除按钮，默认 true */
  clearable?: boolean;
  /** 是否显示"今天"快捷按钮，默认 true */
  showToday?: boolean;
  /** 自定义显示格式，如 "YYYY/MM/DD"、"YYYY年M月" */
  format?: string;
  /** 可选最小日期（含），YYYY-MM-DD 或 YYYY-MM */
  minDate?: string;
  /** 可选最大日期（含），YYYY-MM-DD 或 YYYY-MM */
  maxDate?: string;
}

// ─── 常量 ──────────────────────────────────────────────

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
];
const YEAR_PAGE_SIZE = 20;
const DEFAULT_YEAR_RANGE_PREV_PAGES = 2;
const DEFAULT_YEAR_RANGE_NEXT_PAGES = 1;
const DROPDOWN_WIDTH = 320;
const DROPDOWN_VIEWPORT_MARGIN = 8;

// ─── 工具函数 ──────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfWeek = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

/** 格式化显示值 */
export const formatValue = (
  value: string,
  mode: DatePickerMode,
  fmt?: string,
): string => {
  if (!value) return '';
  const parts = value.split('-').map(Number);
  if (!fmt) {
    if (mode === 'year-month') {
      return `${parts[0]}年${parts[1]}月`;
    }
    return `${parts[0]}年${parts[1]}月${parts[2]}日`;
  }
  // 自定义格式（注意 replace 顺序 — MM 必须在 M 之前替换，否则 MM 会被 M 替换破坏）
  return fmt
    .replace('YYYY', String(parts[0]))
    .replace('MM', String(parts[1]).padStart(2, '0'))
    .replace('M', String(parts[1]))
    .replace('DD', parts[2] ? String(parts[2]).padStart(2, '0') : '')
    .replace('D', parts[2] ? String(parts[2]) : '');
};

/** 解析 YYYY-MM-DD 或 YYYY-MM */
const parseDate = (value: string) => {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  if (year === undefined || month === undefined) return null;
  return {
    year,
    month: month - 1,
    day: parts[2] ?? null,
  };
};

/** 比较两个 YYYY-MM 或 YYYY-MM-DD 字符串，返回 -1/0/1 */
const compareDateStr = (a: string, b: string): number => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

const getYearPageStart = (year: number) =>
  Math.floor(year / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;

// ─── Size Tokens ───────────────────────────────────────

const sizeTokens = {
  sm: {
    trigger: 'h-[32px] px-2.5 text-[12px]',
    cell: 'h-8 w-8 text-[12px]',
    header: 'text-[13px]',
    footer: 'text-[12px]',
    dropdown: 'p-3',
    icon: 14,
  },
  md: {
    trigger: 'h-[36px] px-3 text-[13px]',
    cell: 'h-9 w-9 text-[13px]',
    header: 'text-[15px]',
    footer: 'text-[13px]',
    dropdown: 'p-4',
    icon: 16,
  },
  lg: {
    trigger: 'h-[40px] px-3.5 text-[14px]',
    cell: 'h-10 w-10 text-[14px]',
    header: 'text-[16px]',
    footer: 'text-[14px]',
    dropdown: 'p-5',
    icon: 18,
  },
} as const;

type SizeToken = (typeof sizeTokens)[DatePickerSize];

// ─── 组件 ──────────────────────────────────────────────

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = '请选择日期',
  triggerAriaLabel,
  className,
  mode = 'year-month-day' as DatePickerMode,
  size = 'md' as DatePickerSize,
  disabled = false,
  clearable = true,
  showToday = true,
  format,
  minDate,
  maxDate,
}) => {
  const [open, setOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const tokens = sizeTokens[size];

  // 动画状态
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(
    null,
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // 年月选择模式的视图状态
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearPickerStart, setYearPickerStart] = useState(0);

  // 年月日模式下的子视图
  const [dayView, setDayView] = useState<'day' | 'month' | 'year'>('day');
  const [dayYearPickerStart, setDayYearPickerStart] = useState(0);

  // 下拉面板定位（portal 模式）
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    zIndex: 9999,
  });
  const [dropDirection, setDropDirection] = useState<'up' | 'down'>('down');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = Math.min(
      DROPDOWN_WIDTH,
      Math.max(0, viewportWidth - DROPDOWN_VIEWPORT_MARGIN * 2),
    );
    const estimatedDropdownHeight = mode === 'year-month-day' ? 392 : 304;
    const dropdownHeight =
      portalRef.current?.offsetHeight || estimatedDropdownHeight;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldDropUp = spaceBelow < dropdownHeight;
    const top = shouldDropUp
      ? Math.max(DROPDOWN_VIEWPORT_MARGIN, rect.top - dropdownHeight - gap)
      : rect.bottom + gap;
    const preferredLeft =
      rect.left + dropdownWidth > viewportWidth - DROPDOWN_VIEWPORT_MARGIN
        ? rect.right - dropdownWidth
        : rect.left;
    const maxLeft = Math.max(
      DROPDOWN_VIEWPORT_MARGIN,
      viewportWidth - dropdownWidth - DROPDOWN_VIEWPORT_MARGIN,
    );
    const left = Math.min(
      Math.max(DROPDOWN_VIEWPORT_MARGIN, preferredLeft),
      maxLeft,
    );
    setDropDirection(shouldDropUp ? 'up' : 'down');
    setDropdownStyle({
      position: 'fixed',
      left,
      top,
      width: dropdownWidth,
      zIndex: 9999,
    });
  }, [mode]);

  // 解析当前值
  const parsed = useMemo(() => parseDate(value), [value]);

  // 今天
  const todayDate = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  }, []);

  const todayStr = useMemo(() => {
    return `${todayDate.year}-${pad(todayDate.month + 1)}-${pad(todayDate.day)}`;
  }, [todayDate]);

  const currentYearPageStart = useMemo(
    () => getYearPageStart(todayDate.year),
    [todayDate.year],
  );
  const defaultMinYearPageStart = useMemo(
    () => currentYearPageStart - YEAR_PAGE_SIZE * DEFAULT_YEAR_RANGE_PREV_PAGES,
    [currentYearPageStart],
  );
  const defaultMaxYearPageStart = useMemo(
    () => currentYearPageStart + YEAR_PAGE_SIZE * DEFAULT_YEAR_RANGE_NEXT_PAGES,
    [currentYearPageStart],
  );

  const resolvedMinYearPageStart = useMemo(() => {
    if (!minDate) return defaultMinYearPageStart;
    return Math.min(
      defaultMinYearPageStart,
      getYearPageStart(Number(minDate.substring(0, 4))),
    );
  }, [defaultMinYearPageStart, minDate]);

  const resolvedMaxYearPageStart = useMemo(() => {
    if (!maxDate) return defaultMaxYearPageStart;
    return Math.max(
      defaultMaxYearPageStart,
      getYearPageStart(Number(maxDate.substring(0, 4))),
    );
  }, [defaultMaxYearPageStart, maxDate]);

  // 视图年月
  const [viewYear, setViewYear] = useState(parsed?.year ?? todayDate.year);
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? todayDate.month);

  // 从 value 同步视图
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [parsed]);

  // 关闭下拉（带动画）
  const closeDropdown = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsAnimatingOut(true);
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setIsAnimatingOut(false);
    }, 120);
  }, []);

  // 立即关闭（无动画，用于选择日期后）
  const closeDropdownImmediate = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpen(false);
    setIsAnimatingOut(false);
  }, []);

  // 打开弹窗时初始化：有 value 定位到 value 的年月，否则定位到当月
  useEffect(() => {
    if (open) {
      setDayView('day');
      setShowYearPicker(false);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.month);
      } else {
        setViewYear(todayDate.year);
        setViewMonth(todayDate.month);
      }
      const initialYearPageStart = getYearPageStart(
        parsed?.year ?? todayDate.year,
      );
      setDayYearPickerStart(initialYearPageStart);
      setYearPickerStart(initialYearPageStart);
      updateDropdownPosition();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // 下拉打开时监听滚动和 resize 更新位置
  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [open, updateDropdownPosition]);

  useEffect(() => {
    if (!open) return;

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
  }, [open, updateDropdownPosition, dayView, showYearPicker]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // 外部点击关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // 忽略触发器和 portal 下拉面板内的点击
      if (ref.current?.contains(target)) return;
      const portal = document.querySelector('[data-date-picker-portal]');
      if (portal?.contains(target)) return;
      closeDropdown();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeDropdown]);

  // ─── 范围限制工具 ──────────────────────────────────

  const isDateDisabled = useCallback(
    (dateStr: string) => {
      if (!minDate && !maxDate) return false;
      const d = dateStr.length > 7 ? dateStr : dateStr + '-01';
      const min = minDate
        ? minDate.length === 7
          ? minDate + '-01'
          : minDate
        : null;
      const max = maxDate
        ? maxDate.length === 7
          ? maxDate + '-31'
          : maxDate
        : null;
      if (min && d < min) return true;
      if (max && d > max) return true;
      return false;
    },
    [minDate, maxDate],
  );

  const isMonthDisabled = useCallback(
    (year: number, month: number) => {
      const str = `${year}-${pad(month + 1)}`;
      if (minDate && str < minDate.substring(0, 7)) return true;
      if (maxDate && str > maxDate.substring(0, 7)) return true;
      return false;
    },
    [minDate, maxDate],
  );

  const isYearDisabled = useCallback(
    (year: number) => {
      if (minDate && year < Number(minDate.substring(0, 4))) return true;
      if (maxDate && year > Number(maxDate.substring(0, 4))) return true;
      return false;
    },
    [minDate, maxDate],
  );

  // ─── 导航处理 ──────────────────────────────────────

  const animateSlide = useCallback((direction: 'left' | 'right') => {
    setSlideDirection(direction);
    setIsAnimating(true);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    setSlideDirection(null);
    setIsAnimating(false);
  }, []);

  const canGoPrevMonth = useMemo(() => {
    if (!minDate) return true;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    return (
      !isMonthDisabled(prevYear, prevMonth) ||
      compareDateStr(
        `${prevYear}-${pad(prevMonth + 1)}`,
        minDate.substring(0, 7),
      ) >= 0
    );
  }, [viewYear, viewMonth, minDate, isMonthDisabled]);

  const canGoNextMonth = useMemo(() => {
    if (!maxDate) return true;
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    return (
      !isMonthDisabled(nextYear, nextMonth) ||
      compareDateStr(
        `${nextYear}-${pad(nextMonth + 1)}`,
        maxDate.substring(0, 7),
      ) <= 0
    );
  }, [viewYear, viewMonth, maxDate, isMonthDisabled]);

  const canGoPrevYearRange = yearPickerStart > resolvedMinYearPageStart;
  const canGoNextYearRange = yearPickerStart < resolvedMaxYearPageStart;
  const canGoPrevDayYearRange = dayYearPickerStart > resolvedMinYearPageStart;
  const canGoNextDayYearRange = dayYearPickerStart < resolvedMaxYearPageStart;

  // year-month-day 模式导航
  const prevMonth = useCallback(() => {
    if (isAnimating) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    animateSlide('right');
  }, [viewMonth, isAnimating, animateSlide]);

  const nextMonth = useCallback(() => {
    if (isAnimating) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    animateSlide('left');
  }, [viewMonth, isAnimating, animateSlide]);

  // year-month 模式导航
  const prevYear = useCallback(() => {
    setViewYear((y) => y - 1);
    animateSlide('right');
  }, [animateSlide]);

  const nextYear = useCallback(() => {
    setViewYear((y) => y + 1);
    animateSlide('left');
  }, [animateSlide]);

  const prevYearRange = useCallback(() => {
    setYearPickerStart((s) =>
      Math.max(resolvedMinYearPageStart, s - YEAR_PAGE_SIZE),
    );
  }, [resolvedMinYearPageStart]);

  const nextYearRange = useCallback(() => {
    setYearPickerStart((s) =>
      Math.min(resolvedMaxYearPageStart, s + YEAR_PAGE_SIZE),
    );
  }, [resolvedMaxYearPageStart]);

  const prevDayYearRange = useCallback(() => {
    setDayYearPickerStart((s) =>
      Math.max(resolvedMinYearPageStart, s - YEAR_PAGE_SIZE),
    );
  }, [resolvedMinYearPageStart]);

  const nextDayYearRange = useCallback(() => {
    setDayYearPickerStart((s) =>
      Math.min(resolvedMaxYearPageStart, s + YEAR_PAGE_SIZE),
    );
  }, [resolvedMaxYearPageStart]);

  // ─── 选择处理 ──────────────────────────────────────

  const selectDate = useCallback(
    (dateStr: string) => {
      if (isDateDisabled(dateStr)) return;
      onChange(dateStr);
      closeDropdownImmediate();
    },
    [onChange, isDateDisabled, closeDropdownImmediate],
  );

  const selectMonth = useCallback(
    (year: number, month: number) => {
      const str = `${year}-${pad(month + 1)}`;
      if (minDate && str < minDate.substring(0, 7)) return;
      if (maxDate && str > maxDate.substring(0, 7)) return;
      onChange(str);
      closeDropdownImmediate();
    },
    [onChange, minDate, maxDate, closeDropdownImmediate],
  );

  const selectYear = useCallback(
    (year: number) => {
      if (isYearDisabled(year)) return;
      setViewYear(year);
      setYearPickerStart(getYearPageStart(year));
      setShowYearPicker(false);
    },
    [isYearDisabled],
  );

  // 年月日模式下选年份后回到月份选择
  const selectYearInDayMode = useCallback(
    (year: number) => {
      if (isYearDisabled(year)) return;
      setViewYear(year);
      setDayYearPickerStart(getYearPageStart(year));
      setDayView('month');
    },
    [isYearDisabled],
  );

  // 年月日模式下选月份后回到日历
  const selectMonthInDayMode = useCallback((month: number) => {
    setViewMonth(month);
    setDayView('day');
  }, []);

  // ─── 显示值 ────────────────────────────────────────

  const displayValue = useMemo(() => {
    return formatValue(value, mode, format);
  }, [value, mode, format]);

  // ─── 日历数据 ──────────────────────────────────────

  const days = useMemo(() => {
    const total = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
    const prevTotal =
      viewMonth === 0
        ? getDaysInMonth(viewYear - 1, 11)
        : getDaysInMonth(viewYear, viewMonth - 1);

    const cells: Array<{ day: number; current: boolean; dateStr: string }> = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevTotal - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        day: d,
        current: false,
        dateStr: `${y}-${pad(m + 1)}-${pad(d)}`,
      });
    }

    for (let d = 1; d <= total; d++) {
      cells.push({
        day: d,
        current: true,
        dateStr: `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`,
      });
    }

    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        day: d,
        current: false,
        dateStr: `${y}-${pad(m + 1)}-${pad(d)}`,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  // 选中值解析（year-month 模式）
  const selectedMonth = useMemo(() => {
    if (mode !== 'year-month' || !value) return null;
    const p = parseDate(value);
    return p ? { year: p.year, month: p.month } : null;
  }, [value, mode]);

  // ─── 渲染 ──────────────────────────────────────────

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* 触发按钮 */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerAriaLabel}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (open) closeDropdown();
          else {
            setOpen(true);
            setIsAnimatingOut(false);
          }
        }}
        className={cn(
          `flex w-full items-center border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] outline-none transition-all ${radiusTokens.control}`,
          'hover:border-[var(--lumen-color-border-hover)] focus:border-[var(--lumen-color-primary)]',
          open &&
            !isAnimatingOut &&
            'border-[var(--lumen-color-primary)] ring-1 ring-[var(--lumen-color-primary)]/10',
          tokens.trigger,
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {displayValue ? (
          <span className="text-[var(--lumen-color-text)]">{displayValue}</span>
        ) : (
          <span className="text-[var(--lumen-color-text-placeholder)]">{placeholder}</span>
        )}
        <Calendar
          size={tokens.icon}
          className="ml-auto shrink-0 text-[var(--lumen-color-text-placeholder)]"
        />
      </button>

      {/* 下拉面板（portal 到 body） */}
      {open &&
        createPortal(
          <div
            ref={portalRef}
            data-date-picker-portal
            className="rounded-[12px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-xl"
            style={{
              ...dropdownStyle,
              animation: isAnimatingOut
                ? dropDirection === 'up'
                  ? 'lumen-dropdown-out-up 0.12s ease-in forwards'
                  : 'lumen-dropdown-out 0.12s ease-in forwards'
                : dropDirection === 'up'
                  ? 'lumen-dropdown-in-up 0.12s ease-out'
                  : 'lumen-dropdown-in 0.12s ease-out',
              transformOrigin: dropDirection === 'up' ? 'bottom' : 'top',
            }}
          >
            {mode === 'year-month-day' ? (
              <DayModeContent
                tokens={tokens}
                viewYear={viewYear}
                viewMonth={viewMonth}
                days={days}
                value={value}
                todayStr={todayStr}
                todayDate={todayDate}
                slideDirection={slideDirection}
                dayView={dayView}
                dayYearPickerStart={dayYearPickerStart}
                canGoPrevDayYearRange={canGoPrevDayYearRange}
                canGoNextDayYearRange={canGoNextDayYearRange}
                selectDate={selectDate}
                prevDayYearRange={prevDayYearRange}
                nextDayYearRange={nextDayYearRange}
                prevMonth={prevMonth}
                nextMonth={nextMonth}
                onAnimationEnd={handleAnimationEnd}
                showToday={showToday}
                clearable={clearable}
                onClear={() => {
                  onChange('');
                  closeDropdown();
                }}
                onSelectToday={() => selectDate(todayStr)}
                isDateDisabled={isDateDisabled}
                canGoPrevMonth={canGoPrevMonth}
                canGoNextMonth={canGoNextMonth}
                setDayView={setDayView}
                selectYearInDayMode={selectYearInDayMode}
                selectMonthInDayMode={selectMonthInDayMode}
                prevYear={prevYear}
                nextYear={nextYear}
                isYearDisabled={isYearDisabled}
                isMonthDisabled={isMonthDisabled}
              />
            ) : (
              <MonthModeContent
                tokens={tokens}
                viewYear={viewYear}
                showYearPicker={showYearPicker}
                yearPickerStart={yearPickerStart}
                canGoPrevYearRange={canGoPrevYearRange}
                canGoNextYearRange={canGoNextYearRange}
                selectedMonth={selectedMonth}
                todayDate={todayDate}
                slideDirection={slideDirection}
                selectMonth={selectMonth}
                selectYear={selectYear}
                prevYear={prevYear}
                nextYear={nextYear}
                prevYearRange={prevYearRange}
                nextYearRange={nextYearRange}
                setShowYearPicker={setShowYearPicker}
                onAnimationEnd={handleAnimationEnd}
                showToday={showToday}
                clearable={clearable}
                onClear={() => {
                  onChange('');
                  closeDropdown();
                }}
                onSelectToday={() =>
                  selectMonth(todayDate.year, todayDate.month)
                }
                isMonthDisabled={isMonthDisabled}
                isYearDisabled={isYearDisabled}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

// ─── 年月日模式内容 ────────────────────────────────────

interface DayModeContentProps {
  tokens: SizeToken;
  viewYear: number;
  viewMonth: number;
  days: Array<{ day: number; current: boolean; dateStr: string }>;
  value: string;
  todayStr: string;
  todayDate: { year: number; month: number; day: number };
  slideDirection: 'left' | 'right' | null;
  dayView: 'day' | 'month' | 'year';
  dayYearPickerStart: number;
  canGoPrevDayYearRange: boolean;
  canGoNextDayYearRange: boolean;
  selectDate: (dateStr: string) => void;
  prevDayYearRange: () => void;
  nextDayYearRange: () => void;
  prevMonth: () => void;
  nextMonth: () => void;
  onAnimationEnd: () => void;
  showToday: boolean;
  clearable: boolean;
  onClear: () => void;
  onSelectToday: () => void;
  isDateDisabled: (dateStr: string) => boolean;
  canGoPrevMonth: boolean;
  canGoNextMonth: boolean;
  setDayView: (v: 'day' | 'month' | 'year') => void;
  selectYearInDayMode: (year: number) => void;
  selectMonthInDayMode: (month: number) => void;
  prevYear: () => void;
  nextYear: () => void;
  isYearDisabled: (year: number) => boolean;
  isMonthDisabled: (year: number, month: number) => boolean;
}

const DayModeContent: React.FC<DayModeContentProps> = ({
  tokens,
  viewYear,
  viewMonth,
  days,
  value,
  todayStr,
  todayDate,
  slideDirection,
  dayView,
  dayYearPickerStart,
  canGoPrevDayYearRange,
  canGoNextDayYearRange,
  selectDate,
  prevDayYearRange,
  nextDayYearRange,
  prevMonth,
  nextMonth,
  onAnimationEnd,
  showToday,
  clearable,
  onClear,
  onSelectToday,
  isDateDisabled,
  canGoPrevMonth,
  canGoNextMonth,
  setDayView,
  selectYearInDayMode,
  selectMonthInDayMode,
  prevYear,
  nextYear,
  isYearDisabled,
  isMonthDisabled,
}) => (
  <>
    <div className={cn(tokens.dropdown, 'pb-0')}>
      {dayView === 'year' ? (
        /* ─── 年份选择器 ────────────────────────── */
        <>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              disabled={!canGoPrevDayYearRange}
              onClick={prevDayYearRange}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors',
                canGoPrevDayYearRange
                  ? 'hover:bg-[var(--lumen-color-surface-muted)]'
                  : 'cursor-not-allowed opacity-40',
              )}
            >
              <ChevronLeft size={18} />
            </button>
            <span className={cn(tokens.header, 'font-semibold text-[var(--lumen-color-text)]')}>
              {dayYearPickerStart} - {dayYearPickerStart + 19}
            </span>
            <button
              type="button"
              disabled={!canGoNextDayYearRange}
              onClick={nextDayYearRange}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors',
                canGoNextDayYearRange
                  ? 'hover:bg-[var(--lumen-color-surface-muted)]'
                  : 'cursor-not-allowed opacity-40',
              )}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1 text-center">
            {Array.from({ length: 20 }, (_, i) => dayYearPickerStart + i).map(
              (y) => {
                const disabled = isYearDisabled(y);
                const isCurrent = y === todayDate.year;
                const isSelected = y === viewYear;
                return (
                  <button
                    key={y}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectYearInDayMode(y)}
                    className={cn(
                      'mx-auto flex h-10 w-full items-center justify-center rounded-full text-[13px] transition-all',
                      isSelected &&
                        'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)] shadow-sm',
                      !isSelected &&
                        isCurrent &&
                        'font-semibold text-[var(--lumen-color-primary)]',
                      !isSelected &&
                        !isCurrent &&
                        !disabled &&
                        'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)]',
                      disabled && 'cursor-not-allowed text-[var(--lumen-color-border-hover)]',
                    )}
                  >
                    {y}
                  </button>
                );
              },
            )}
          </div>
        </>
      ) : dayView === 'month' ? (
        /* ─── 月份选择器 ────────────────────────── */
        <>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevYear}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-surface-muted)]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setDayView('year')}
              className={cn(
                tokens.header,
                'font-semibold text-[var(--lumen-color-text)] hover:text-[var(--lumen-color-primary)] transition-colors',
              )}
            >
              {viewYear}年
            </button>
            <button
              type="button"
              onClick={nextYear}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-surface-muted)]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((label, idx) => {
              const isCurrent =
                viewYear === todayDate.year && idx === todayDate.month;
              const isSelected =
                viewYear === todayDate.year && idx === viewMonth;
              const disabled = isMonthDisabled(viewYear, idx);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectMonthInDayMode(idx)}
                  className={cn(
                    'relative flex h-10 items-center justify-center rounded-full text-[13px] transition-all',
                    isSelected &&
                      'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)] shadow-sm',
                    !isSelected && isCurrent && 'font-semibold text-[var(--lumen-color-primary)]',
                    !isSelected &&
                      !isCurrent &&
                      !disabled &&
                      'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)]',
                    disabled && 'cursor-not-allowed text-[var(--lumen-color-border-hover)]',
                  )}
                >
                  {label}
                  {isCurrent && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--lumen-color-primary)]" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        /* ─── 日期选择器（默认视图） ────────────── */
        <>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDayView('year')}
                className={cn(
                  tokens.header,
                  'font-semibold text-[var(--lumen-color-text)] hover:text-[var(--lumen-color-primary)] transition-colors',
                )}
              >
                {viewYear}年
              </button>
              <button
                type="button"
                onClick={() => setDayView('month')}
                className={cn(
                  tokens.header,
                  'font-semibold text-[var(--lumen-color-text)] hover:text-[var(--lumen-color-primary)] transition-colors',
                )}
              >
                {MONTHS[viewMonth]}
              </button>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canGoNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 星期标题 + 日期网格（含翻页动画） */}
          <div className="overflow-hidden">
            <div
              onAnimationEnd={onAnimationEnd}
              style={
                slideDirection === 'left'
                  ? { animation: 'calendarSlideLeft 0.2s ease-out' }
                  : slideDirection === 'right'
                    ? { animation: 'calendarSlideRight 0.2s ease-out' }
                    : undefined
              }
            >
              {/* 星期标题 */}
              <div className="mb-1 grid grid-cols-7 text-center">
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    className="py-1.5 text-[12px] font-medium text-[var(--lumen-color-text-placeholder)]"
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* 日期网格 */}
              <div className="grid grid-cols-7 text-center">
                {days.map((cell, i) => {
                  const isSelected = cell.dateStr === value;
                  const isToday = cell.dateStr === todayStr;
                  const isDisabled =
                    cell.current && isDateDisabled(cell.dateStr);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectDate(cell.dateStr)}
                      className={cn(
                        'relative mx-auto flex items-center justify-center rounded-full transition-all',
                        tokens.cell,
                        !cell.current && 'text-[var(--lumen-color-border-hover)]',
                        isDisabled && 'pointer-events-none text-[var(--lumen-color-border-hover)]',
                        cell.current &&
                          !isSelected &&
                          !isDisabled &&
                          'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)]',
                        isSelected &&
                          'bg-[var(--lumen-color-primary)] text-[var(--lumen-color-on-primary)] font-medium shadow-sm',
                        isToday &&
                          !isSelected &&
                          !isDisabled &&
                          'font-semibold text-[var(--lumen-color-primary)]',
                      )}
                    >
                      {cell.day}
                      {isToday && !isSelected && (
                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--lumen-color-primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>

    {/* 底部操作 */}
    {(showToday || (clearable && value)) && (
      <div className="flex items-center justify-between border-t border-[var(--lumen-color-surface-muted)] px-4 py-3">
        {showToday && (
          <button
            type="button"
            onClick={onSelectToday}
            className={cn(
              tokens.footer,
              'font-medium text-[var(--lumen-color-primary)] hover:text-[var(--lumen-color-primary-active)] transition-colors',
            )}
          >
            今天
          </button>
        )}
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              tokens.footer,
              'text-[var(--lumen-color-text-placeholder)] hover:text-[var(--lumen-color-text-muted)] transition-colors ml-auto',
            )}
          >
            清除
          </button>
        )}
      </div>
    )}
  </>
);

// ─── 年月模式内容 ──────────────────────────────────────

interface MonthModeContentProps {
  tokens: SizeToken;
  viewYear: number;
  showYearPicker: boolean;
  yearPickerStart: number;
  canGoPrevYearRange: boolean;
  canGoNextYearRange: boolean;
  selectedMonth: { year: number; month: number } | null;
  todayDate: { year: number; month: number; day: number };
  slideDirection: 'left' | 'right' | null;
  selectMonth: (year: number, month: number) => void;
  selectYear: (year: number) => void;
  prevYear: () => void;
  nextYear: () => void;
  setShowYearPicker: (v: boolean) => void;
  onAnimationEnd: () => void;
  prevYearRange: () => void;
  nextYearRange: () => void;
  showToday: boolean;
  clearable: boolean;
  onClear: () => void;
  onSelectToday: () => void;
  isMonthDisabled: (year: number, month: number) => boolean;
  isYearDisabled: (year: number) => boolean;
}

const MonthModeContent: React.FC<MonthModeContentProps> = ({
  tokens,
  viewYear,
  showYearPicker,
  yearPickerStart,
  canGoPrevYearRange,
  canGoNextYearRange,
  selectedMonth,
  todayDate,
  slideDirection,
  selectMonth,
  selectYear,
  prevYear,
  nextYear,
  prevYearRange,
  nextYearRange,
  setShowYearPicker,
  onAnimationEnd,
  showToday,
  clearable,
  onClear,
  onSelectToday,
  isMonthDisabled,
  isYearDisabled,
}) => (
  <>
    <div className={cn(tokens.dropdown, 'pb-0')}>
      {showYearPicker ? (
        // ─── 年份选择器 ──────────────────────────
        <>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              disabled={!canGoPrevYearRange}
              onClick={prevYearRange}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors',
                canGoPrevYearRange
                  ? 'hover:bg-[var(--lumen-color-surface-muted)]'
                  : 'cursor-not-allowed opacity-40',
              )}
            >
              <ChevronLeft size={18} />
            </button>
            <span className={cn(tokens.header, 'font-semibold text-[var(--lumen-color-text)]')}>
              {yearPickerStart} - {yearPickerStart + 19}
            </span>
            <button
              type="button"
              disabled={!canGoNextYearRange}
              onClick={nextYearRange}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors',
                canGoNextYearRange
                  ? 'hover:bg-[var(--lumen-color-surface-muted)]'
                  : 'cursor-not-allowed opacity-40',
              )}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1 text-center">
            {Array.from({ length: 20 }, (_, i) => yearPickerStart + i).map(
              (y) => {
                const disabled = isYearDisabled(y);
                const isCurrent = y === todayDate.year;
                const isSelected = y === viewYear;
                return (
                  <button
                    key={y}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectYear(y)}
                    className={cn(
                      'mx-auto flex h-10 w-full items-center justify-center rounded-full text-[13px] transition-all',
                      isSelected &&
                        'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)] shadow-sm',
                      !isSelected &&
                        isCurrent &&
                        'font-semibold text-[var(--lumen-color-primary)]',
                      !isSelected &&
                        !isCurrent &&
                        !disabled &&
                        'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)]',
                      disabled && 'cursor-not-allowed text-[var(--lumen-color-border-hover)]',
                    )}
                  >
                    {y}
                  </button>
                );
              },
            )}
          </div>
        </>
      ) : (
        // ─── 月份选择器 ──────────────────────────
        <>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevYear}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-surface-muted)]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowYearPicker(true)}
              className={cn(
                tokens.header,
                'font-semibold text-[var(--lumen-color-text)] hover:text-[var(--lumen-color-primary)] transition-colors',
              )}
            >
              {viewYear}年
            </button>
            <button
              type="button"
              onClick={nextYear}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-surface-muted)]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="overflow-hidden">
            <div
              onAnimationEnd={onAnimationEnd}
              style={
                slideDirection === 'left'
                  ? { animation: 'calendarSlideLeft 0.2s ease-out' }
                  : slideDirection === 'right'
                    ? { animation: 'calendarSlideRight 0.2s ease-out' }
                    : undefined
              }
            >
              <div className="grid grid-cols-4 gap-2">
                {MONTHS.map((label, idx) => {
                  const isSelected =
                    selectedMonth?.year === viewYear &&
                    selectedMonth?.month === idx;
                  const isCurrent =
                    viewYear === todayDate.year && idx === todayDate.month;
                  const disabled = isMonthDisabled(viewYear, idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectMonth(viewYear, idx)}
                      className={cn(
                        'relative flex h-10 items-center justify-center rounded-full text-[13px] transition-all',
                        isSelected &&
                          'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)] shadow-sm',
                        !isSelected &&
                          isCurrent &&
                          'font-semibold text-[var(--lumen-color-primary)]',
                        !isSelected &&
                          !isCurrent &&
                          !disabled &&
                          'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)]',
                        disabled && 'cursor-not-allowed text-[var(--lumen-color-border-hover)]',
                      )}
                    >
                      {label}
                      {isCurrent && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--lumen-color-primary)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>

    {/* 底部操作 */}
    {(showToday || (clearable && selectedMonth)) && (
      <div className="flex items-center justify-between border-t border-[var(--lumen-color-surface-muted)] px-4 py-3">
        {showToday && (
          <button
            type="button"
            onClick={onSelectToday}
            className={cn(
              tokens.footer,
              'font-medium text-[var(--lumen-color-primary)] hover:text-[var(--lumen-color-primary-active)] transition-colors',
            )}
          >
            今天
          </button>
        )}
        {clearable && selectedMonth && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              tokens.footer,
              'text-[var(--lumen-color-text-placeholder)] hover:text-[var(--lumen-color-text-muted)] transition-colors ml-auto',
            )}
          >
            清除
          </button>
        )}
      </div>
    )}
  </>
);
