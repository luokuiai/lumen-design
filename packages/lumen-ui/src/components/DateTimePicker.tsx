import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from './Button';
import { cn } from './classNames';
import { radiusTokens } from './designTokens';
import { TimeSelector } from './TimeSelector';

export interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
  minuteStep?: number;
  placeholder?: string;
  precision?: 'minute' | 'second';
  minDate?: string;
  minDateTime?: string;
  defaultToNow?: boolean;
}

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

const pad = (value: number) => String(value).padStart(2, '0');

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDateTime = (
  date: string,
  hour: string,
  minute: string,
  second: string,
) => `${date} ${hour}:${minute}:${second}`;

const formatDisplayDateTime = (
  date: string,
  hour: string,
  minute: string,
  second: string,
  precision: 'minute' | 'second',
) =>
  precision === 'minute'
    ? `${date} ${hour}:${minute}`
    : formatDateTime(date, hour, minute, second);

const parseDateTime = (value: string) => {
  const matched = value
    .trim()
    .replace('T', ' ')
    .match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!matched) {
    return null;
  }
  return {
    date: matched[1]!,
    hour: matched[2] ?? '09',
    minute: matched[3] ?? '00',
    second: matched[4] ?? '00',
  };
};

const getDateTimeTimestamp = (
  date: string,
  hour: string,
  minute: string,
  second: string,
) => {
  const matched = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) {
    return null;
  }
  const timestamp = new Date(
    Number(matched[1]),
    Number(matched[2]) - 1,
    Number(matched[3]),
    Number(hour),
    Number(minute),
    Number(second),
  ).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getParsedTimestamp = (value?: string) => {
  if (!value) {
    return null;
  }
  const parsed = parseDateTime(value);
  return parsed
    ? getDateTimeTimestamp(
        parsed.date,
        parsed.hour,
        parsed.minute,
        parsed.second,
      )
    : null;
};

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getCalendarCells = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay();
  const currentDays = getDaysInMonth(year, month);
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const previousDays = getDaysInMonth(previousYear, previousMonth);
  const cells: Array<{ date: string; day: number; current: boolean }> = [];

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    const day = previousDays - index;
    cells.push({
      date: `${previousYear}-${pad(previousMonth + 1)}-${pad(day)}`,
      day,
      current: false,
    });
  }

  for (let day = 1; day <= currentDays; day += 1) {
    cells.push({
      date: `${year}-${pad(month + 1)}-${pad(day)}`,
      day,
      current: true,
    });
  }

  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  while (cells.length < 42) {
    const day = cells.length - firstDay - currentDays + 1;
    cells.push({
      date: `${nextYear}-${pad(nextMonth + 1)}-${pad(day)}`,
      day,
      current: false,
    });
  }

  return cells;
};

const PANEL_WIDTH = 560;
const ESTIMATED_PANEL_HEIGHT = 374;
const PANEL_GAP = 6;
const CLOSE_ANIMATION_DURATION = 120;

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  className,
  minuteStep = 1,
  placeholder = '请选择日期时间',
  precision = 'second',
  minDate,
  minDateTime,
  defaultToNow = false,
}) => {
  const parsed = useMemo(() => parseDateTime(value), [value]);
  const today = useMemo(() => new Date(), []);
  const initialDate = parsed?.date ?? formatDate(today);
  const initialYear = Number(initialDate.slice(0, 4));
  const initialMonth = Number(initialDate.slice(5, 7)) - 1;

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [draftDate, setDraftDate] = useState(initialDate);
  const [draftHour, setDraftHour] = useState(
    parsed?.hour ?? (defaultToNow ? pad(today.getHours()) : '09'),
  );
  const [draftMinute, setDraftMinute] = useState(
    parsed?.minute ?? (defaultToNow ? pad(today.getMinutes()) : '00'),
  );
  const [draftSecond, setDraftSecond] = useState(
    parsed?.second ?? (defaultToNow ? pad(today.getSeconds()) : '00'),
  );
  const [dropDirection, setDropDirection] = useState<'up' | 'down'>('down');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedValueRef = useRef(value);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    zIndex: 9999,
  });

  const cells = useMemo(
    () => getCalendarCells(viewYear, viewMonth),
    [viewMonth, viewYear],
  );
  const minDateText = minDate ?? parseDateTime(minDateTime ?? '')?.date ?? null;
  const minDateTimeValue = getParsedTimestamp(minDateTime);
  const displayValue = parsed
    ? formatDisplayDateTime(
        parsed.date,
        parsed.hour,
        parsed.minute,
        parsed.second,
        precision,
      )
    : '';

  const syncDraftFromValue = useCallback(() => {
    const next = parseDateTime(value);
    const fallback = defaultToNow ? new Date() : today;
    const nextDate = next?.date ?? formatDate(fallback);
    setDraftDate(nextDate);
    setDraftHour(
      next?.hour ?? (defaultToNow ? pad(fallback.getHours()) : '09'),
    );
    setDraftMinute(
      next?.minute ?? (defaultToNow ? pad(fallback.getMinutes()) : '00'),
    );
    setDraftSecond(
      next?.second ?? (defaultToNow ? pad(fallback.getSeconds()) : '00'),
    );
    setViewYear(Number(nextDate.slice(0, 4)));
    setViewMonth(Number(nextDate.slice(5, 7)) - 1);
    syncedValueRef.current = value;
  }, [defaultToNow, today, value]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (syncedValueRef.current === value) {
      return;
    }
    syncDraftFromValue();
  }, [open, syncDraftFromValue, value]);

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const panelHeight =
      panelRef.current?.offsetHeight || ESTIMATED_PANEL_HEIGHT;
    const panelWidth = Math.min(PANEL_WIDTH, Math.max(0, window.innerWidth - 16));
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldDropUp = spaceBelow < panelHeight + PANEL_GAP;
    const top = shouldDropUp
      ? Math.max(8, rect.top - panelHeight - PANEL_GAP)
      : rect.bottom + PANEL_GAP;
    const left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, window.innerWidth - panelWidth - 8),
    );
    setDropDirection(shouldDropUp ? 'up' : 'down');
    setPanelStyle({
      position: 'fixed',
      left,
      top,
      width: panelWidth,
      maxHeight: 'calc(100dvh - 16px)',
      zIndex: 9999,
    });
  }, []);

  const openPanel = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsAnimatingOut(false);
    syncDraftFromValue();
    updatePosition();
    setOpen(true);
  };

  const closePanel = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setIsAnimatingOut(true);
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
      setIsAnimatingOut(false);
    }, CLOSE_ANIMATION_DURATION);
  }, []);

  const closePanelImmediate = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    setOpen(false);
    setIsAnimatingOut(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const frame = window.requestAnimationFrame(updatePosition);
    if (!panelRef.current || typeof ResizeObserver === 'undefined') {
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new ResizeObserver(updatePosition);
    observer.observe(panelRef.current);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [open, precision, updatePosition]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        wrapperRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      closePanel();
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () =>
      document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [closePanel, open]);

  const changeMonth = (offset: number) => {
    const next = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isDateDisabled = (date: string) =>
    minDateText != null && date < minDateText;

  const isTimeDisabled = (date: string, hour: string, minute: string) => {
    if (minDateTimeValue == null) {
      return false;
    }
    const timestamp = getDateTimeTimestamp(date, hour, minute, '00');
    return timestamp != null && timestamp < minDateTimeValue;
  };

  const confirm = () => {
    const draftTimestamp = getDateTimeTimestamp(
      draftDate,
      draftHour,
      draftMinute,
      precision === 'minute' ? '00' : draftSecond,
    );
    if (minDateTimeValue != null && draftTimestamp != null) {
      if (draftTimestamp < minDateTimeValue) {
        return;
      }
    }
    onChange(
      formatDateTime(
        draftDate,
        draftHour,
        draftMinute,
        precision === 'minute' ? '00' : draftSecond,
      ),
    );
    closePanelImmediate();
  };

  const selectToday = () => {
    const now = new Date();
    setDraftDate(formatDate(now));
    const nextHour = pad(now.getHours());
    const nextMinute = pad(now.getMinutes());
    const nextSecond = pad(now.getSeconds());
    setDraftHour(nextHour);
    setDraftMinute(nextMinute);
    setDraftSecond(nextSecond);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <input
        aria-label={`${label}值`}
        className="sr-only"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        tabIndex={-1}
      />
      <button
        type="button"
        ref={triggerRef}
        aria-label={label}
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return;
          }
          if (open) {
            closePanel();
          } else {
            openPanel();
          }
        }}
        className={cn(
          'flex h-[40px] w-full items-center gap-2 border bg-[var(--lumen-color-surface)] px-3.5 text-left text-[13px] outline-none transition-all',
          radiusTokens.control,
          disabled
            ? 'cursor-not-allowed border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface-muted)] text-[var(--lumen-color-text-placeholder)]'
            : open
              ? 'border-[var(--lumen-color-primary)] ring-1 ring-[var(--lumen-color-primary)]/10'
              : 'border-[var(--lumen-color-border)] hover:border-[var(--lumen-color-border-hover)]',
        )}
      >
        <Calendar size={16} className="shrink-0 text-[var(--lumen-color-text-placeholder)]" />
        <span
          className={cn(
            'min-w-0 flex-1 truncate',
            displayValue ? 'text-[var(--lumen-color-text)]' : 'text-[var(--lumen-color-text-placeholder)]',
          )}
        >
          {displayValue || placeholder}
        </span>
        <Clock size={16} className="shrink-0 text-[var(--lumen-color-text-placeholder)]" />
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              data-date-time-picker-panel
              className="overflow-x-hidden overflow-y-auto rounded-[8px] border border-[var(--lumen-color-border)] bg-[var(--lumen-color-surface)] shadow-[0_18px_46px_var(--lumen-color-shadow)]"
              style={{
                ...panelStyle,
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
              <div
                className={cn(
                  'grid grid-cols-1',
                  precision === 'minute'
                    ? 'pad:grid-cols-[minmax(0,1fr)_148px]'
                    : 'pad:grid-cols-[minmax(0,1fr)_210px]',
                )}
              >
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-surface-muted)]"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="text-[14px] font-semibold text-[var(--lumen-color-text)]">
                      {viewYear}年{MONTHS[viewMonth]}
                    </div>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[var(--lumen-color-text-muted)] hover:bg-[var(--lumen-color-surface-muted)]"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-[12px] font-medium text-[var(--lumen-color-text-placeholder)]">
                    {WEEKDAYS.map((weekday) => (
                      <div key={weekday} className="py-1.5">
                        {weekday}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 text-center">
                    {cells.map((cell) => {
                      const selected = cell.date === draftDate;
                      const dateDisabled = isDateDisabled(cell.date);
                      return (
                        <button
                          key={cell.date}
                          type="button"
                          aria-label={`选择日期 ${cell.date}`}
                          disabled={dateDisabled}
                          onClick={() => setDraftDate(cell.date)}
                          className={cn(
                            'mx-auto my-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-all',
                            !cell.current && 'text-[var(--lumen-color-border-hover)]',
                            dateDisabled &&
                              'cursor-not-allowed text-[var(--lumen-color-border-hover)] hover:bg-transparent hover:text-[var(--lumen-color-border-hover)]',
                            cell.current &&
                              !selected &&
                              !dateDisabled &&
                              'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)]',
                            selected &&
                              'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)] shadow-sm',
                          )}
                        >
                          {cell.day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <TimeSelector
                  hour={draftHour}
                  minute={draftMinute}
                  second={draftSecond}
                  onHourChange={setDraftHour}
                  onMinuteChange={setDraftMinute}
                  onSecondChange={setDraftSecond}
                  precision={precision}
                  minuteStep={minuteStep}
                  isHourDisabled={(hour) =>
                    isTimeDisabled(draftDate, hour, '59')
                  }
                  isMinuteDisabled={(minute) =>
                    isTimeDisabled(draftDate, draftHour, minute)
                  }
                  className="border-t border-[var(--lumen-color-surface-muted)] pad:border-l pad:border-t-0"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--lumen-color-surface-muted)] px-3 py-3 pad:px-4">
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    closePanel();
                  }}
                  className="text-[13px] text-[var(--lumen-color-text-placeholder)] transition-colors hover:text-[var(--lumen-color-text-muted)]"
                >
                  清除
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectToday}
                    className="text-[13px] font-medium text-[var(--lumen-color-primary)] transition-colors hover:text-[var(--lumen-color-primary-active)]"
                  >
                    此刻
                  </button>
                  <Button type="button" size="sm" onClick={confirm}>
                    确定
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
