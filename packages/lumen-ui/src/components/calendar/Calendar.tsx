import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '../classNames';
import { useLumenLocale } from '../../i18n';

export type CalendarSize = 'sm' | 'md' | 'lg';

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  minDate?: string;
  maxDate?: string;
  size?: CalendarSize;
  showToday?: boolean;
  clearable?: boolean;
  showOutsideDays?: boolean;
  todayText?: React.ReactNode;
  clearText?: React.ReactNode;
  weekdays?: readonly string[];
  months?: readonly string[];
}

const YEAR_PAGE_SIZE = 20;

const sizeTokens = {
  sm: { cell: 'h-8 w-8 text-[12px]', header: 'text-[13px]', footer: 'text-[12px]', padding: 'p-3' },
  md: { cell: 'h-9 w-9 text-[13px]', header: 'text-[15px]', footer: 'text-[13px]', padding: 'p-4' },
  lg: { cell: 'h-10 w-10 text-[14px]', header: 'text-[16px]', footer: 'text-[14px]', padding: 'p-5' },
} as const;

const iconButtonClassName =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] transition-colors hover:bg-[var(--lumen-color-surface-muted)] hover:text-[var(--lumen-color-text-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';
const headerButtonClassName =
  'cursor-pointer rounded-[6px] px-2 py-1 font-semibold text-[var(--lumen-color-text)] transition-colors hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20';
const optionFocusClassName =
  'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lumen-color-primary)]/20';

const pad = (value: number) => String(value).padStart(2, '0');
const toDateString = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;
const parseDate = (value?: string) => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? { year, month, day }
    : null;
};
const getYearPageStart = (year: number) => Math.floor(year / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value,
      defaultValue = '',
      onChange,
      minDate,
      maxDate,
      size = 'md',
      showToday = true,
      clearable = true,
      showOutsideDays = true,
      todayText,
      clearText,
      weekdays: weekdaysProp,
      months: monthsProp,
      className,
      ...props
    },
    ref,
  ) => {
    const locale = useLumenLocale();
    const weekdays = weekdaysProp ?? locale.calendar.weekdays;
    const months = monthsProp ?? locale.calendar.months;
    const resolvedTodayText = todayText === undefined ? locale.common.today : todayText;
    const resolvedClearText = clearText === undefined ? locale.common.clear : clearText;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const selectedValue = value ?? internalValue;
    const today = useMemo(() => {
      const date = new Date();
      return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
    }, []);
    const todayValue = toDateString(today.year, today.month, today.day);
    const selectedDate = useMemo(() => parseDate(selectedValue), [selectedValue]);
    const [viewYear, setViewYear] = useState(selectedDate?.year ?? today.year);
    const [viewMonth, setViewMonth] = useState(selectedDate?.month ?? today.month);
    const [view, setView] = useState<'day' | 'month' | 'year'>('day');
    const [yearPageStart, setYearPageStart] = useState(
      getYearPageStart(selectedDate?.year ?? today.year),
    );
    const [focusedDate, setFocusedDate] = useState(selectedValue || todayValue);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const tokens = sizeTokens[size];

    useEffect(() => {
      if (!selectedDate) return;
      setViewYear(selectedDate.year);
      setViewMonth(selectedDate.month);
      setYearPageStart(getYearPageStart(selectedDate.year));
    }, [selectedDate]);

    const isDateDisabled = useCallback(
      (date: string) => Boolean((minDate && date < minDate) || (maxDate && date > maxDate)),
      [maxDate, minDate],
    );
    const isMonthDisabled = useCallback(
      (year: number, month: number) => {
        const monthValue = `${year}-${pad(month + 1)}`;
        return Boolean(
          (minDate && monthValue < minDate.slice(0, 7)) ||
          (maxDate && monthValue > maxDate.slice(0, 7)),
        );
      },
      [maxDate, minDate],
    );
    const isYearDisabled = useCallback(
      (year: number) => Boolean(
        (minDate && year < Number(minDate.slice(0, 4))) ||
        (maxDate && year > Number(maxDate.slice(0, 4))),
      ),
      [maxDate, minDate],
    );

    const commitValue = (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue);
      onChange?.(nextValue);
    };

    const changeMonth = (offset: number) => {
      const date = new Date(viewYear, viewMonth + offset, 1);
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
      setSlideDirection(offset > 0 ? 'left' : 'right');
    };

    const days = useMemo(() => {
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const start = new Date(viewYear, viewMonth, 1 - firstDay);
      return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
        return {
          day: date.getDate(),
          current: date.getMonth() === viewMonth,
          date: toDateString(date.getFullYear(), date.getMonth(), date.getDate()),
        };
      });
    }, [viewMonth, viewYear]);

    const previousMonth = new Date(viewYear, viewMonth - 1, 1);
    const nextMonth = new Date(viewYear, viewMonth + 1, 1);
    const canGoPrevious = !isMonthDisabled(previousMonth.getFullYear(), previousMonth.getMonth());
    const canGoNext = !isMonthDisabled(nextMonth.getFullYear(), nextMonth.getMonth());
    const effectiveFocusedDate = days.some(
      (cell) => cell.date === focusedDate && (cell.current || showOutsideDays) && !isDateDisabled(cell.date),
    )
      ? focusedDate
      : days.find((cell) => cell.current && !isDateDisabled(cell.date))?.date;

    const handleDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const buttons = Array.from(
        event.currentTarget.closest('[role="grid"]')?.querySelectorAll<HTMLButtonElement>('[role="gridcell"]') ?? [],
      );
      const currentIndex = buttons.indexOf(event.currentTarget);
      let nextIndex = currentIndex;
      if (event.key === 'ArrowLeft') nextIndex -= 1;
      else if (event.key === 'ArrowRight') nextIndex += 1;
      else if (event.key === 'ArrowUp') nextIndex -= 7;
      else if (event.key === 'ArrowDown') nextIndex += 7;
      else if (event.key === 'Home') nextIndex -= currentIndex % 7;
      else if (event.key === 'End') nextIndex += 6 - (currentIndex % 7);
      else return;

      event.preventDefault();
      const direction = nextIndex < currentIndex ? -1 : 1;
      while (
        nextIndex >= 0 &&
        nextIndex < buttons.length &&
        (buttons[nextIndex]?.disabled || buttons[nextIndex]?.getAttribute('aria-hidden') === 'true')
      ) {
        nextIndex += direction;
      }
      buttons[nextIndex]?.focus();
    };

    return (
      <div
        {...props}
        ref={ref}
        data-ui="calendar"
        data-size={size}
        className={cn('w-[320px] max-w-full bg-[var(--lumen-color-surface)]', className)}
      >
        <div className={cn(tokens.padding, 'pb-0')}>
          {view === 'year' ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button type="button" aria-label={locale.calendar.previousYearPage} onClick={() => setYearPageStart((start) => start - YEAR_PAGE_SIZE)} className={iconButtonClassName}>
                  <ChevronLeft size={18} />
                </button>
                <span className={cn(tokens.header, 'font-semibold text-[var(--lumen-color-text)]')}>
                  {yearPageStart} - {yearPageStart + YEAR_PAGE_SIZE - 1}
                </span>
                <button type="button" aria-label={locale.calendar.nextYearPage} onClick={() => setYearPageStart((start) => start + YEAR_PAGE_SIZE)} className={iconButtonClassName}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => yearPageStart + index).map((year) => {
                  const disabled = isYearDisabled(year);
                  const selected = year === viewYear;
                  return (
                    <button
                      key={year}
                      type="button"
                      disabled={disabled}
                      className={cn(
                        'mx-auto flex h-10 w-12 items-center justify-center rounded-full text-[13px] transition-all',
                        optionFocusClassName,
                        selected && 'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)] shadow-sm',
                        !selected && year === today.year && 'font-semibold text-[var(--lumen-color-primary)]',
                        !selected && year !== today.year && !disabled && 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)]',
                        disabled && 'cursor-not-allowed text-[var(--lumen-color-border-hover)]',
                      )}
                      onClick={() => {
                        setViewYear(year);
                        setYearPageStart(getYearPageStart(year));
                        setView('month');
                      }}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </>
          ) : view === 'month' ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button type="button" aria-label={locale.calendar.previousYear} onClick={() => setViewYear((year) => year - 1)} className={iconButtonClassName}>
                  <ChevronLeft size={18} />
                </button>
                <button type="button" onClick={() => { setYearPageStart(getYearPageStart(viewYear)); setView('year'); }} className={cn(tokens.header, headerButtonClassName)}>
                  {locale.calendar.year(viewYear)}
                </button>
                <button type="button" aria-label={locale.calendar.nextYear} onClick={() => setViewYear((year) => year + 1)} className={iconButtonClassName}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {months.map((monthLabel, month) => {
                  const disabled = isMonthDisabled(viewYear, month);
                  const selected = viewYear === (selectedDate?.year ?? viewYear) && month === selectedDate?.month;
                  const current = viewYear === today.year && month === today.month;
                  return (
                    <button
                      key={month}
                      type="button"
                      disabled={disabled}
                      className={cn(
                        'relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-[13px] transition-all',
                        optionFocusClassName,
                        selected && 'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)] shadow-sm',
                        !selected && current && 'font-semibold text-[var(--lumen-color-primary)]',
                        !selected && !current && !disabled && 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)]',
                        disabled && 'cursor-not-allowed text-[var(--lumen-color-border-hover)]',
                      )}
                      onClick={() => { setViewMonth(month); setView('day'); }}
                    >
                      {monthLabel}
                      {current && !selected ? <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--lumen-color-primary)]" /> : null}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <button type="button" aria-label={locale.calendar.previousMonth} disabled={!canGoPrevious} onClick={() => changeMonth(-1)} className={iconButtonClassName}>
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => { setYearPageStart(getYearPageStart(viewYear)); setView('year'); }} className={cn(tokens.header, headerButtonClassName)}>{locale.calendar.year(viewYear)}</button>
                  <button type="button" onClick={() => setView('month')} className={cn(tokens.header, headerButtonClassName)}>{months[viewMonth]}</button>
                </div>
                <button type="button" aria-label={locale.calendar.nextMonth} disabled={!canGoNext} onClick={() => changeMonth(1)} className={iconButtonClassName}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="overflow-hidden">
                <div
                  onAnimationEnd={() => setSlideDirection(null)}
                  style={slideDirection === 'left'
                    ? { animation: 'calendarSlideLeft 0.2s ease-out' }
                    : slideDirection === 'right'
                      ? { animation: 'calendarSlideRight 0.2s ease-out' }
                      : undefined}
                >
                  <div role="grid" aria-label={locale.calendar.month(viewYear, viewMonth + 1)} className="grid grid-cols-7 text-center">
                    <div role="row" className="contents">
                      {weekdays.map((weekday, index) => (
                        <div key={`${weekday}-${index}`} role="columnheader" className="mb-1 py-1.5 text-[12px] font-medium text-[var(--lumen-color-text-placeholder)]">{weekday}</div>
                      ))}
                    </div>
                    {Array.from({ length: 6 }, (_, week) => (
                      <div key={week} role="row" className="contents">
                        {days.slice(week * 7, week * 7 + 7).map((cell) => {
                          const selected = cell.date === selectedValue;
                          const current = cell.date === todayValue;
                          const disabled = isDateDisabled(cell.date);
                          const hidden = !cell.current && !showOutsideDays;
                          return (
                            <button
                              key={cell.date}
                              type="button"
                              role="gridcell"
                              aria-current={current ? 'date' : undefined}
                              aria-hidden={hidden || undefined}
                              aria-label={cell.date}
                              aria-selected={selected}
                              disabled={disabled}
                              tabIndex={cell.date === effectiveFocusedDate ? 0 : -1}
                              className={cn(
                                'relative mx-auto flex items-center justify-center rounded-full transition-all',
                                optionFocusClassName,
                                tokens.cell,
                                !cell.current && 'text-[var(--lumen-color-border-hover)]',
                                hidden && 'invisible',
                                disabled && 'cursor-not-allowed text-[var(--lumen-color-border-hover)]',
                                cell.current && !selected && !disabled && 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)]',
                                selected && 'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)] shadow-sm',
                                current && !selected && !disabled && 'font-semibold text-[var(--lumen-color-primary)]',
                              )}
                              onFocus={() => setFocusedDate(cell.date)}
                              onKeyDown={handleDayKeyDown}
                              onClick={() => commitValue(cell.date)}
                            >
                              {cell.day}
                              {current && !selected ? <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--lumen-color-primary)]" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {(showToday || (clearable && selectedValue)) ? (
          <div className="flex items-center justify-between border-t border-[var(--lumen-color-surface-muted)] px-4 py-3">
            {showToday ? (
              <button type="button" disabled={isDateDisabled(todayValue)} onClick={() => commitValue(todayValue)} className={cn(tokens.footer, 'font-medium text-[var(--lumen-color-primary)] transition-colors hover:text-[var(--lumen-color-primary-active)] disabled:cursor-not-allowed disabled:opacity-40')}>
                {resolvedTodayText}
              </button>
            ) : null}
            {clearable && selectedValue ? (
              <button type="button" onClick={() => commitValue('')} className={cn(tokens.footer, 'ml-auto text-[var(--lumen-color-text-placeholder)] transition-colors hover:text-[var(--lumen-color-text-muted)]')}>
                {resolvedClearText}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

Calendar.displayName = 'Calendar';
