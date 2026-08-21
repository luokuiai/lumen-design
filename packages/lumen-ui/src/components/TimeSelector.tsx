import React, { useEffect, useMemo, useRef } from 'react';
import { cn } from './classNames';

export type TimePrecision = 'minute' | 'second';

export interface TimeSelectorProps {
  hour: string;
  minute: string;
  second?: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onSecondChange?: (value: string) => void;
  precision?: TimePrecision;
  minuteStep?: number;
  isHourDisabled?: (value: string) => boolean;
  isMinuteDisabled?: (value: string) => boolean;
  isSecondDisabled?: (value: string) => boolean;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

const buildOptions = (count: number, step = 1) => {
  const values: string[] = [];
  for (let value = 0; value < count; value += step) {
    values.push(pad(value));
  }
  return values;
};

interface TimeColumnProps {
  title: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
  isDisabled?: (value: string) => boolean;
}

const TimeColumn: React.FC<TimeColumnProps> = ({
  title,
  values,
  selected,
  onSelect,
  isDisabled,
}) => (
  <div className="min-w-0 flex-1 border-l border-[var(--lumen-color-surface-muted)] first:border-l-0">
    <div className="border-b border-[var(--lumen-color-surface-muted)] px-2 py-2 text-center text-[12px] font-medium text-[var(--lumen-color-text-muted)]">
      {title}
    </div>
    <div
      data-time-selector-column
      data-date-time-picker-time-column
      className="date-time-picker-time-column time-selector-column max-h-[266px] overflow-y-auto p-1"
    >
      {values.map((item) => {
        const disabled = isDisabled?.(item) ?? false;
        return (
          <button
            key={item}
            type="button"
            aria-label={`${title}${item}`}
            aria-current={selected === item ? 'time' : undefined}
            data-selected={selected === item ? 'true' : undefined}
            disabled={disabled}
            onClick={() => onSelect(item)}
            className={cn(
              'block w-full rounded-[6px] px-2 py-1.5 text-center text-[13px] transition-colors',
              selected === item
                ? 'bg-[var(--lumen-color-primary)] font-medium text-[var(--lumen-color-on-primary)]'
                : 'text-[var(--lumen-color-text-secondary)] hover:bg-[var(--lumen-color-primary-soft)] hover:text-[var(--lumen-color-primary)]',
              disabled &&
                'cursor-not-allowed text-[var(--lumen-color-border-hover)] hover:bg-transparent hover:text-[var(--lumen-color-border-hover)]',
            )}
          >
            {item}
          </button>
        );
      })}
    </div>
  </div>
);

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  hour,
  minute,
  second = '00',
  onHourChange,
  onMinuteChange,
  onSecondChange,
  precision = 'minute',
  minuteStep = 1,
  isHourDisabled,
  isMinuteDisabled,
  isSecondDisabled,
  className,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const hours = useMemo(() => buildOptions(24), []);
  const minutes = useMemo(() => buildOptions(60, minuteStep), [minuteStep]);
  const seconds = useMemo(() => buildOptions(60), []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      rootRef.current
        ?.querySelectorAll<HTMLElement>('[data-time-selector-column]')
        .forEach((column) => {
          const selected = column.querySelector<HTMLElement>(
            '[data-selected="true"]',
          );
          if (!selected) return;
          const top = Math.max(
            0,
            selected.offsetTop -
              column.clientHeight / 2 +
              selected.offsetHeight / 2,
          );
          if (typeof column.scrollTo === 'function') {
            column.scrollTo({ top });
          } else {
            column.scrollTop = top;
          }
        });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <style>{`
        .time-selector-column { scrollbar-width: none; }
        .time-selector-column::-webkit-scrollbar { width: 0; }
        .time-selector-column:hover,
        .time-selector-column:focus-within {
          scrollbar-width: thin;
          scrollbar-color: var(--lumen-color-border-hover) transparent;
        }
        .time-selector-column:hover::-webkit-scrollbar,
        .time-selector-column:focus-within::-webkit-scrollbar { width: 6px; }
        .time-selector-column::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: var(--lumen-color-border-hover);
        }
        .time-selector-column::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      <div
        ref={rootRef}
        className={cn(
          'grid',
          precision === 'minute' ? 'grid-cols-2' : 'grid-cols-3',
          className,
        )}
      >
        <TimeColumn
          title="时"
          values={hours}
          selected={hour}
          onSelect={onHourChange}
          isDisabled={isHourDisabled}
        />
        <TimeColumn
          title="分"
          values={minutes}
          selected={minute}
          onSelect={onMinuteChange}
          isDisabled={isMinuteDisabled}
        />
        {precision === 'second' ? (
          <TimeColumn
            title="秒"
            values={seconds}
            selected={second}
            onSelect={onSecondChange ?? (() => undefined)}
            isDisabled={isSecondDisabled}
          />
        ) : null}
      </div>
    </>
  );
};
